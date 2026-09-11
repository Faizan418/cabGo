// services/passwordReset.service.js

const crypto = require('crypto');
const userModel = require('../models/user.model');
const captainModel = require('../models/captain.model');
const passwordResetModel = require('../models/passwordReset.model');
const { sendPasswordResetOtpEmail } = require('./email.service');

const OTP_EXPIRY_MINUTES = 10;
const RESET_TOKEN_EXPIRY_MINUTES = 10;
const RESEND_COOLDOWN_SECONDS = 60;
const MAX_VERIFICATION_ATTEMPTS = 5;

function getSecret() {
    return process.env.JWT_SECRET || 'cabgo_secure_default_secret_key';
}

function hashValue(value) {
    return crypto.createHmac('sha256', getSecret()).update(String(value)).digest('hex');
}

/**
 * Step 1: Request OTP for password reset
 */
async function sendResetOtp({ email, userType }) {
    if (!['user', 'captain'].includes(userType)) {
        throw new Error('Invalid account type specified');
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check account existence
    let account = null;
    if (userType === 'user') {
        account = await userModel.findOne({ email: normalizedEmail });
    } else {
        account = await captainModel.findOne({ email: normalizedEmail });
    }

    if (!account) {
        const error = new Error(`No ${userType} account found with this email address.`);
        error.statusCode = 404;
        throw error;
    }

    // Check resend cooldown
    const existingReset = await passwordResetModel.findOne({
        email: normalizedEmail,
        userType
    });

    if (existingReset && existingReset.lastRequestedAt) {
        const secondsSinceLast = Math.floor((Date.now() - existingReset.lastRequestedAt.getTime()) / 1000);
        if (secondsSinceLast < RESEND_COOLDOWN_SECONDS) {
            const waitSeconds = RESEND_COOLDOWN_SECONDS - secondsSinceLast;
            const error = new Error(`Please wait ${waitSeconds} seconds before requesting a new OTP.`);
            error.statusCode = 429;
            error.waitSeconds = waitSeconds;
            throw error;
        }
    }

    // Generate secure 5-digit numeric OTP (10000 to 99999)
    const otp = crypto.randomInt(10000, 100000).toString();
    const otpHash = hashValue(otp);
    const otpExpiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    // Save or update PasswordReset record
    await passwordResetModel.findOneAndUpdate(
        { email: normalizedEmail, userType },
        {
            otpHash,
            otpExpiresAt,
            attempts: 0,
            maxAttempts: MAX_VERIFICATION_ATTEMPTS,
            lastRequestedAt: new Date(),
            resetTokenHash: null,
            resetTokenExpiresAt: null,
            verified: false,
            createdAt: new Date() // Resets MongoDB TTL index timer
        },
        { upsert: true, returnDocument: 'after' }
    );

    // Dispatch email
    const recipientName = account.fullname?.firstname || (userType === 'captain' ? 'Captain' : 'Rider');
    await sendPasswordResetOtpEmail({
        to: normalizedEmail,
        otp,
        recipientName
    });

    return {
        message: 'A 5-digit verification code has been sent to your registered email address.'
    };
}

/**
 * Step 2: Verify OTP and issue temporary single-use reset authorization token
 */
async function verifyResetOtp({ email, otp, userType }) {
    if (!['user', 'captain'].includes(userType)) {
        throw new Error('Invalid account type specified');
    }

    const normalizedEmail = email.toLowerCase().trim();
    const cleanOtp = String(otp).trim();

    if (!cleanOtp || !/^\d{5}$/.test(cleanOtp)) {
        const error = new Error('Please enter a valid 5-digit numeric code.');
        error.statusCode = 400;
        throw error;
    }

    const record = await passwordResetModel.findOne({
        email: normalizedEmail,
        userType
    });

    if (!record) {
        const error = new Error('No password reset request found for this email. Please request a code first.');
        error.statusCode = 400;
        throw error;
    }

    // Check maximum attempts reached
    if (record.attempts >= record.maxAttempts) {
        const error = new Error('Too many failed attempts. This OTP has been invalidated. Please request a new OTP.');
        error.statusCode = 400;
        throw error;
    }

    // Check expiration
    if (record.otpExpiresAt < new Date()) {
        const error = new Error('This OTP has expired. Please request a new one.');
        error.statusCode = 400;
        throw error;
    }

    // Compare hash with timing-safe equal
    const candidateHash = hashValue(cleanOtp);
    const candidateBuffer = Buffer.from(candidateHash, 'hex');
    const storedBuffer = Buffer.from(record.otpHash, 'hex');

    let isMatch = false;
    if (candidateBuffer.length === storedBuffer.length) {
        isMatch = crypto.timingSafeEqual(candidateBuffer, storedBuffer);
    }

    if (!isMatch) {
        record.attempts += 1;
        await record.save();

        const remaining = record.maxAttempts - record.attempts;
        let msg = `The OTP you entered is incorrect.`;
        if (remaining > 0) {
            msg += ` ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`;
        } else {
            msg = 'Too many failed attempts. This OTP has been invalidated. Please request a new OTP.';
        }

        const error = new Error(msg);
        error.statusCode = 400;
        error.remainingAttempts = remaining;
        throw error;
    }

    // Valid OTP: Generate temporary single-use reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = hashValue(resetToken);
    const resetTokenExpiresAt = new Date(Date.now() + RESET_TOKEN_EXPIRY_MINUTES * 60 * 1000);

    record.verified = true;
    record.resetTokenHash = resetTokenHash;
    record.resetTokenExpiresAt = resetTokenExpiresAt;
    record.otpHash = 'ALREADY_USED_' + Date.now(); // Invalidate OTP so it cannot be used again
    await record.save();

    return {
        message: 'OTP verified successfully.',
        resetToken
    };
}

/**
 * Step 3: Reset password using verified single-use reset token
 */
async function resetPassword({ resetToken, newPassword, confirmPassword, userType }) {
    if (!['user', 'captain'].includes(userType)) {
        throw new Error('Invalid account type specified');
    }

    if (!resetToken) {
        const error = new Error('Reset authorization token is missing or invalid.');
        error.statusCode = 400;
        throw error;
    }

    if (!newPassword || newPassword.length < 6) {
        const error = new Error('Password must be at least 6 characters long.');
        error.statusCode = 400;
        throw error;
    }

    if (confirmPassword && newPassword !== confirmPassword) {
        const error = new Error('Passwords do not match.');
        error.statusCode = 400;
        throw error;
    }

    const candidateTokenHash = hashValue(resetToken);

    const record = await passwordResetModel.findOne({
        resetTokenHash: candidateTokenHash,
        userType,
        verified: true
    });

    if (!record) {
        const error = new Error('Invalid or expired password reset authorization. Please request a new code.');
        error.statusCode = 400;
        throw error;
    }

    // Check token expiration
    if (record.resetTokenExpiresAt && record.resetTokenExpiresAt < new Date()) {
        await passwordResetModel.deleteOne({ _id: record._id });
        const error = new Error('Password reset authorization has expired. Please start over.');
        error.statusCode = 400;
        throw error;
    }

    // Hash password using project's existing bcrypt hashing mechanism
    let hashedPassword;
    if (userType === 'user') {
        hashedPassword = await userModel.hashPassword(newPassword);
        await userModel.findOneAndUpdate(
            { email: record.email },
            { password: hashedPassword }
        );
    } else {
        hashedPassword = await captainModel.hashPassword(newPassword);
        await captainModel.findOneAndUpdate(
            { email: record.email },
            { password: hashedPassword }
        );
    }

    // Immediately remove reset record to prevent token replay
    await passwordResetModel.deleteOne({ _id: record._id });

    return {
        message: 'Your password has been updated successfully. Please log in with your new password.'
    };
}

module.exports = {
    sendResetOtp,
    verifyResetOtp,
    resetPassword
};
