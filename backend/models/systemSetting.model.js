// models/systemSetting.model.js
const mongoose = require('mongoose');

const vehiclePricingSchema = new mongoose.Schema({
    baseFare: { type: Number, required: true },
    perKm: { type: Number, required: true },
    perMinute: { type: Number, required: true },
    minimumFare: { type: Number, required: true },
    bookingFee: { type: Number, default: 0 },
    fuelAverageKmPerLiter: { type: Number, required: true }
}, { _id: false });

const systemSettingSchema = new mongoose.Schema({
    commissionRate: {
        type: Number,
        default: 10, // Default 10%
        min: 0,
        max: 100
    },
    promotionalFreeRides: {
        type: Number,
        default: 5, // First 5 rides at 0% commission for new approved captains
        min: 0
    },
    fuelPrice: {
        type: Number,
        default: 280, // PKR per liter
        min: 0
    },
    vehiclePricing: {
        bike: {
            type: vehiclePricingSchema,
            default: () => ({
                baseFare: 60,
                perKm: 15,
                perMinute: 2,
                minimumFare: 80,
                bookingFee: 10,
                fuelAverageKmPerLiter: 45
            })
        },
        auto: {
            type: vehiclePricingSchema,
            default: () => ({
                baseFare: 100,
                perKm: 22,
                perMinute: 2.5,
                minimumFare: 120,
                bookingFee: 15,
                fuelAverageKmPerLiter: 25
            })
        },
        car: {
            type: vehiclePricingSchema,
            default: () => ({
                baseFare: 150,
                perKm: 30,
                perMinute: 4,
                minimumFare: 200,
                bookingFee: 20,
                fuelAverageKmPerLiter: 14
            })
        }
    }
}, { timestamps: true });

// Singleton helper: get existing or initialize default settings
systemSettingSchema.statics.getSettings = async function () {
    let settings = await this.findOne();
    if (!settings) {
        settings = await this.create({});
    }
    return settings;
};

module.exports = mongoose.model('SystemSetting', systemSettingSchema);
