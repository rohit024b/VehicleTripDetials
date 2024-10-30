const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    tripId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', required: true },
    totalDistance: { type: Number, required: true }, // Total distance in Km
    totalTravelledDuration: { type: Number, required: true }, // Total traveled duration in minutes
    overSpeedingDuration: { type: Number, default: 0 }, // Over speeding duration in minutes
    overSpeedingDistance: { type: Number, default: 0 }, // Over speeding distance in Km
    totalStoppedDuration: { type: Number, default: 0 }, // Stopped duration in minutes
    idleDuration: { type: Number, default: 0 }, // Idle duration in minutes
    generatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Report', reportSchema);
