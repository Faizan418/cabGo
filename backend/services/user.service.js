// services/user.service.js

const userModel = require('../models/user.model');

module.exports.createUser = async ({
    firstname,
    lastname,
    email,
    password,
    phone,
    cnic
}) => {
    if (!firstname || !email || !password || !phone || !cnic) {
        throw new Error('All fields are required...');
    }

    const user = await userModel.create({
        fullname: {
            firstname,
            lastname
        },
        email,
        password,
        phone,
        cnic
    });

    return user;
};