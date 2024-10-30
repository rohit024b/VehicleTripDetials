const mongoose = require('mongoose');

const coordinateSchema = new mongoose.Schema({
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    timestamp: { type: Date, required: true },
    ignition: { type: Boolean, required: true },
});

const tripSchema = new mongoose.Schema({
    name: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    coordinates: [coordinateSchema], // Stores trip coordinates and details
    startTime: { type: Date },
    endTime: { type: Date },
    totalDistance: { type: Number, default: 0 }, // in Km
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Trip', tripSchema);
