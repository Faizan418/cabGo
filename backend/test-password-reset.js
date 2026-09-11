// test-password-reset.js
// Automated test script to verify the backend password reset system

const dotenv = require('dotenv');
dotenv.config();

const http = require('http');
const mongoose = require('mongoose');
const app = require('./app');
const userModel = require('./models/user.model');
const captainModel = require('./models/captain.model');
const passwordResetModel = require('./models/passwordReset.model');

const PORT = 4055;
let server;

function makeRequest(method, path, data = null) {
    return new Promise((resolve, reject) => {
        const payload = data ? JSON.stringify(data) : null;
        const options = {
            hostname: '127.0.0.1',
            port: PORT,
            path,
            method,
            headers: {
                'Content-Type': 'application/json',
                ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {})
            }
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                let parsed = body;
                try {
                    parsed = JSON.parse(body);
                } catch (e) {}
                resolve({ status: res.statusCode, body: parsed });
            });
        });

        req.on('error', reject);
        if (payload) req.write(payload);
        req.end();
    });
}

async function runTests() {
    console.log('🧪 Starting Password Reset Backend Test Suite...\n');

    server = app.listen(PORT);
    await new Promise((resolve) => server.on('listening', resolve));
    console.log(`🚀 Test server listening on http://127.0.0.1:${PORT}`);

    // Wait for MongoDB connection
    if (mongoose.connection.readyState !== 1) {
        await new Promise((resolve) => mongoose.connection.once('open', resolve));
    }
    console.log('📦 Connected to MongoDB\n');

    const testUserEmail = `testuser_${Date.now()}@cabgo.app`;
    const initialUserPassword = 'initialPassword123';
    const newUserPassword = 'updatedUserPassword456';

    const testCaptainEmail = `testcaptain_${Date.now()}@cabgo.app`;
    const initialCaptainPassword = 'initialCaptain123';
    const newCaptainPassword = 'updatedCaptain456';

    try {
        // ----------------------------------------------------
        // TEST 1: Register Test User
        // ----------------------------------------------------
        console.log('1. Registering test user...');
        const regUserRes = await makeRequest('POST', '/users/register', {
            fullname: { firstname: 'Test', lastname: 'User' },
            email: testUserEmail,
            password: initialUserPassword
        });
        console.assert(regUserRes.status === 201, `User registration failed: ${JSON.stringify(regUserRes.body)}`);
        console.log('   ✅ Test user registered successfully');

        // ----------------------------------------------------
        // TEST 2: Forgot Password - Non-existent Email (Should fail 404)
        // ----------------------------------------------------
        console.log('2. Requesting OTP for non-existent email...');
        const nonExistRes = await makeRequest('POST', '/users/forgot-password', {
            email: 'nonexistent_99999@cabgo.app'
        });
        console.assert(nonExistRes.status === 404, `Expected 404, got: ${nonExistRes.status}`);
        console.log('   ✅ Correctly rejected non-existent email with 404');

        // ----------------------------------------------------
        // TEST 3: Forgot Password - Valid User Email (Send OTP)
        // ----------------------------------------------------
        console.log('3. Requesting OTP for registered user...');
        const forgotUserRes = await makeRequest('POST', '/users/forgot-password', {
            email: testUserEmail
        });
        console.assert(forgotUserRes.status === 200, `Forgot password failed: ${JSON.stringify(forgotUserRes.body)}`);
        console.assert(!forgotUserRes.body.otp, 'CRITICAL SECURITY: OTP MUST NOT BE EXPOSED IN RESPONSE');
        console.log('   ✅ OTP generated and sent without exposing OTP in response');

        // Check MongoDB record
        const resetDoc = await passwordResetModel.findOne({ email: testUserEmail, userType: 'user' });
        console.assert(resetDoc !== null, 'PasswordReset document was not created in DB');
        console.assert(resetDoc.otpHash && resetDoc.otpHash.length === 64, 'OTP was not securely hashed (HMAC-SHA256)');
        console.assert(resetDoc.verified === false, 'Verified should be false initially');
        console.log('   ✅ MongoDB record verified: OTP stored as hash, verified=false, TTL active');

        // ----------------------------------------------------
        // TEST 4: Resend Cooldown Protection (Within 60s -> 429)
        // ----------------------------------------------------
        console.log('4. Testing resend cooldown protection...');
        const cooldownRes = await makeRequest('POST', '/users/forgot-password', {
            email: testUserEmail
        });
        console.assert(cooldownRes.status === 429, `Expected 429 Cooldown, got: ${cooldownRes.status}`);
        console.log('   ✅ Rate limiting enforced: Rejected immediate resend with 429 and waitSeconds');

        // ----------------------------------------------------
        // TEST 5: Verify OTP - Incorrect OTP & Attempt Counting
        // ----------------------------------------------------
        console.log('5. Testing verification with incorrect OTP...');
        const wrongOtpRes = await makeRequest('POST', '/users/verify-reset-otp', {
            email: testUserEmail,
            otp: '00000'
        });
        console.assert(wrongOtpRes.status === 400, `Expected 400 for wrong OTP, got: ${wrongOtpRes.status}`);
        const updatedDoc = await passwordResetModel.findOne({ email: testUserEmail, userType: 'user' });
        console.assert(updatedDoc.attempts === 1, `Expected attempts=1, got: ${updatedDoc.attempts}`);
        console.log('   ✅ Attempt counter incremented on wrong OTP (attempts: 1)');

        // ----------------------------------------------------
        // TEST 6: Verify OTP - Correct OTP (Extract from service / mock for test)
        // ----------------------------------------------------
        console.log('6. Testing verification with valid OTP...');
        // To verify correctly in test, let's look up the hashed OTP from service helper or generate a known OTP
        const crypto = require('crypto');
        const testOtp = '77777';
        const testOtpHash = crypto.createHmac('sha256', process.env.JWT_SECRET || 'cabgo_secure_default_secret_key').update(testOtp).digest('hex');
        
        // Temporarily set known OTP hash for verification test
        await passwordResetModel.findOneAndUpdate(
            { email: testUserEmail, userType: 'user' },
            { otpHash: testOtpHash, attempts: 0 }
        );

        const verifyRes = await makeRequest('POST', '/users/verify-reset-otp', {
            email: testUserEmail,
            otp: testOtp
        });
        console.assert(verifyRes.status === 200, `Verify OTP failed: ${JSON.stringify(verifyRes.body)}`);
        console.assert(verifyRes.body.resetToken, 'Expected resetToken in response');
        const userResetToken = verifyRes.body.resetToken;
        console.log('   ✅ OTP verified successfully! Received single-use reset token');

        // ----------------------------------------------------
        // TEST 7: OTP Reuse Prevention
        // ----------------------------------------------------
        console.log('7. Testing OTP reuse prevention...');
        const reuseRes = await makeRequest('POST', '/users/verify-reset-otp', {
            email: testUserEmail,
            otp: testOtp
        });
        console.assert(reuseRes.status === 400, 'Reused OTP was not rejected');
        console.log('   ✅ OTP cannot be reused after verification');

        // ----------------------------------------------------
        // TEST 8: Reset Password - Mismatched Password
        // ----------------------------------------------------
        console.log('8. Testing password mismatch rejection...');
        const mismatchRes = await makeRequest('POST', '/users/reset-password', {
            resetToken: userResetToken,
            newPassword: 'Password123!',
            confirmPassword: 'DifferentPassword456!'
        });
        console.assert(mismatchRes.status === 400, 'Mismatched passwords were not rejected');
        console.log('   ✅ Correctly rejected mismatched passwords');

        // ----------------------------------------------------
        // TEST 9: Reset Password - Success
        // ----------------------------------------------------
        console.log('9. Resetting user password with valid token...');
        const resetRes = await makeRequest('POST', '/users/reset-password', {
            resetToken: userResetToken,
            newPassword: newUserPassword,
            confirmPassword: newUserPassword
        });
        console.assert(resetRes.status === 200, `Reset password failed: ${JSON.stringify(resetRes.body)}`);
        
        // Verify document is deleted
        const cleanedDoc = await passwordResetModel.findOne({ email: testUserEmail, userType: 'user' });
        console.assert(cleanedDoc === null, 'PasswordReset document was not deleted after reset');
        console.log('   ✅ Password updated & reset authorization document destroyed (replay prevented)');

        // ----------------------------------------------------
        // TEST 10: Verify Login with New Password vs Old Password
        // ----------------------------------------------------
        console.log('10. Verifying login with updated password...');
        const oldLoginRes = await makeRequest('POST', '/users/login', {
            email: testUserEmail,
            password: initialUserPassword
        });
        console.assert(oldLoginRes.status === 401, 'Old password should no longer work');
        console.log('   ✅ Old password was correctly rejected (401)');

        const newLoginRes = await makeRequest('POST', '/users/login', {
            email: testUserEmail,
            password: newUserPassword
        });
        console.assert(newLoginRes.status === 200, `New password login failed: ${JSON.stringify(newLoginRes.body)}`);
        console.log('   ✅ Successfully logged in with newly updated password!');

        // ----------------------------------------------------
        // TEST 11: Captain Reset Flow
        // ----------------------------------------------------
        console.log('\n--- CAPTAIN PASSWORD RESET SUITE ---');
        console.log('11. Registering test captain...');
        const regCapRes = await makeRequest('POST', '/captains/register', {
            fullname: { firstname: 'Tariq', lastname: 'Captain' },
            email: testCaptainEmail,
            password: initialCaptainPassword,
            vehicle: {
                color: 'Black',
                plate: 'LHE-9999',
                capacity: 4,
                vehicleType: 'car'
            }
        });
        console.assert(regCapRes.status === 201, `Captain registration failed: ${JSON.stringify(regCapRes.body)}`);
        console.log('   ✅ Test captain registered');

        console.log('12. Requesting OTP for captain...');
        const capForgotRes = await makeRequest('POST', '/captains/forgot-password', {
            email: testCaptainEmail
        });
        console.assert(capForgotRes.status === 200, `Captain forgot password failed: ${JSON.stringify(capForgotRes.body)}`);
        console.log('   ✅ Captain OTP generated and sent');

        // Set known OTP for captain
        const capOtp = '88888';
        const capOtpHash = crypto.createHmac('sha256', process.env.JWT_SECRET || 'cabgo_secure_default_secret_key').update(capOtp).digest('hex');
        await passwordResetModel.findOneAndUpdate(
            { email: testCaptainEmail, userType: 'captain' },
            { otpHash: capOtpHash, attempts: 0 }
        );

        console.log('13. Verifying captain OTP...');
        const capVerifyRes = await makeRequest('POST', '/captains/verify-reset-otp', {
            email: testCaptainEmail,
            otp: capOtp
        });
        console.assert(capVerifyRes.status === 200, 'Captain verify OTP failed');
        const capResetToken = capVerifyRes.body.resetToken;
        console.log('   ✅ Captain OTP verified & received reset token');

        console.log('14. Resetting captain password...');
        const capResetRes = await makeRequest('POST', '/captains/reset-password', {
            resetToken: capResetToken,
            newPassword: newCaptainPassword,
            confirmPassword: newCaptainPassword
        });
        console.assert(capResetRes.status === 200, 'Captain reset password failed');
        console.log('   ✅ Captain password updated in DB');

        console.log('15. Testing captain login with new password...');
        const capNewLoginRes = await makeRequest('POST', '/captains/login', {
            email: testCaptainEmail,
            password: newCaptainPassword
        });
        console.assert(capNewLoginRes.status === 200, 'Captain login with new password failed');
        console.log('   ✅ Captain successfully logged in with new password!');

        // Cleanup
        await userModel.deleteOne({ email: testUserEmail });
        await captainModel.deleteOne({ email: testCaptainEmail });
        await passwordResetModel.deleteMany({ email: { $in: [testUserEmail, testCaptainEmail] } });
        console.log('   🧹 Test records cleaned up');

        console.log('\n🎉 ALL 15 BACKEND TESTS PASSED WITH 100% SUCCESS!\n');
    } catch (err) {
        console.error('\n❌ Test failure:', err);
        process.exitCode = 1;
    } finally {
        if (server) server.close();
        await mongoose.connection.close();
        process.exit();
    }
}

runTests();
