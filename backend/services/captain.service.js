// services/captain.service.js

const captainModel = require('../models/captain.model');

module.exports.createCaptain = async ({ 
    firstname,
    lastname,
    email,
    password,
    phone,
    cnic,
    drivingLicense,
    color,
    plate,
    capacity,
    vehicleType,
    make = '',
    model = '',
    year = null
}) => {
    if (!firstname || !email || !password || !phone || !cnic || !drivingLicense || !color || !plate || !capacity || !vehicleType) {
        throw new Error('All required registration fields must be provided');
    }

    const captain = await captainModel.create({
        fullname: { firstname, lastname },
        email,
        password,
        phone,
        cnic,
        drivingLicense,
        vehicle: {
            color,
            plate,
            capacity,
            vehicleType,
            make,
            model,
            year: year ? Number(year) : undefined
        },
        status: 'unactive',
        verificationStatus: 'pending',
        walletBalance: 0,
        walletReserve: 0,
        completedRidesCount: 0
    });

    return captain;
};

// Captain Availability Toggle
module.exports.toggleAvailability = async (captainId, status) => {
    if (!['active', 'unactive'].includes(status)) {
        throw new Error('Invalid status');
    }

    const captain = await captainModel.findById(captainId);
    if (!captain) {
        throw new Error('Captain not found');
    }

    // Only approved captains are allowed to go online
    if (status === 'active' && captain.verificationStatus !== 'approved') {
        const err = new Error(
            'Your account verification is pending approval. You cannot go online until approved by an administrator.'
        );
        err.statusCode = 403;
        throw err;
    }

    const updateData = { status };

    // Set default coordinates if empty when going active
    if (status === 'active') {
        if (!captain.location || !captain.location.coordinates || captain.location.coordinates.length === 0) {
            updateData.location = {
                type: 'Point',
                coordinates: [74.3587, 31.5204] // default Lahore [lng, lat]
            };
        }
    }

    const updatedCaptain = await captainModel.findByIdAndUpdate(
        captainId,
        updateData,
        { new: true }
    );

    return updatedCaptain;
};