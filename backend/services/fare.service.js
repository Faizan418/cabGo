// services/fare.service.js
const mapService = require('./maps.service');
const SystemSetting = require('../models/systemSetting.model');

/**
 * Calculate dynamic fares using configured pricing, fuel prices, and distance/time.
 */
async function calculateFares(pickup, destination) {
    if (!pickup || !destination) {
        throw new Error('Pickup and destination are required');
    }

    const distanceTime = await mapService.getDistanceTime(pickup, destination);
    const distanceInKm = (distanceTime.distance?.value || 0) / 1000;
    const durationInMin = (distanceTime.duration?.value || 0) / 60;

    const settings = await SystemSetting.getSettings();
    const fuelPrice = settings.fuelPrice || 280;
    const vehiclePricing = settings.vehiclePricing;

    // Surge pricing factor
    const hour = new Date().getHours();
    const isNight = hour >= 23 || hour <= 6;
    const isPeak = hour >= 17 && hour <= 20;

    let surgeMultiplier = 1;
    let surgeReason = null;
    if (isNight) {
        surgeMultiplier = 1.2;
        surgeReason = 'Night Surge (1.2x)';
    } else if (isPeak) {
        surgeMultiplier = 1.3;
        surgeReason = 'Peak Hours Surge (1.3x)';
    }

    const fares = {};
    const breakdowns = {};

    ['bike', 'auto', 'car'].forEach(type => {
        const pricing = vehiclePricing[type] || {
            baseFare: 100,
            perKm: 20,
            perMinute: 2,
            minimumFare: 100,
            bookingFee: 10,
            fuelAverageKmPerLiter: 20
        };

        const fuelCostPerKm = fuelPrice / (pricing.fuelAverageKmPerLiter || 20);
        const distanceFare = distanceInKm * pricing.perKm;
        const fuelSurcharge = distanceInKm * fuelCostPerKm;
        const timeFare = durationInMin * pricing.perMinute;
        const bookingFee = pricing.bookingFee || 0;

        const subtotal = pricing.baseFare + distanceFare + fuelSurcharge + timeFare + bookingFee;
        const clampedFare = Math.max(subtotal, pricing.minimumFare);
        const finalFare = Math.round(clampedFare * surgeMultiplier);

        fares[type] = finalFare;
        breakdowns[type] = {
            baseFare: pricing.baseFare,
            distanceInKm: Number(distanceInKm.toFixed(2)),
            durationInMin: Math.round(durationInMin),
            distanceFare: Math.round(distanceFare),
            fuelSurcharge: Math.round(fuelSurcharge),
            timeFare: Math.round(timeFare),
            bookingFee,
            surgeMultiplier,
            surgeReason,
            minimumFare: pricing.minimumFare,
            totalFare: finalFare
        };
    });

    return {
        fares,
        distanceTime,
        breakdowns,
        fuelPrice
    };
}

module.exports = {
    calculateFares
};
