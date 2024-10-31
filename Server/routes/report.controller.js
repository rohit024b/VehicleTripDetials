const express = require('express');
const { getDistance, getSpeed } = require('geolib');
const auth = require('../middlewares/auth');
const TripModel = require('../models/trip.model');
const ReportModel = require('../models/report.model');
const router = express.Router();

router.get('/:tripId', auth, async (req, res) => {
    try {
        // trip data 
        const trip = await TripModel.findById(req.params.tripId).select('coordinates');
        if (!trip) {
            return res.status(404).json({ error: 'Trip not found' });
        }

        // Check if a report already exists for this trip
        const existingReport = await ReportModel.findOne({ tripId: trip._id });
        if (existingReport) {
            // If a report exists, return the existing report and gps data
            return res.json({ reportData: existingReport, gpsData: trip.coordinates }); //redundancy 
        }

        // Perform calculations for the report
        let totalDistance = 0;
        let totalTravelledDuration = 0;
        let overSpeedingDuration = 0;
        let overSpeedingDistance = 0;
        let totalStoppedDuration = 0;
        let idleDuration = 0;

        // Define your thresholds
        const SPEED_LIMIT = 60; // km/h for overspeeding threshold
        const TIME_INTERVAL = 2; // seconds between points

        for (let i = 0; i < trip.coordinates.length - 1; i++) {
            const start = trip.coordinates[i];
            const end = trip.coordinates[i + 1];
            const distance = getDistance(
                { latitude: start.latitude, longitude: start.longitude },
                { latitude: end.latitude, longitude: end.longitude }
            );

            // Update total distance
            totalDistance += distance;

            // calculate speed
            const speed = getSpeed(
                { latitude: start.latitude, longitude: start.longitude, time: start.timestamp },
                { latitude: end.latitude, longitude: end.longitude, time: end.timestamp }
            );

            // determine if the vehicle is moving
            const isMoving = distance > 0 && start.ignition && end.ignition;

            if (isMoving) {
                totalTravelledDuration += TIME_INTERVAL / 60; // convert seconds to minutes

                // Over Speeding Check
                if (speed > SPEED_LIMIT) {
                    overSpeedingDuration += TIME_INTERVAL / 60;
                    overSpeedingDistance += distance / 1000; // convert meters to kilometers
                }
            } else if (start.ignition && !isMoving) {
                idleDuration += TIME_INTERVAL / 60; // ignition on but stationary
            } else if (!start.ignition) {
                totalStoppedDuration += TIME_INTERVAL / 60; // ignition off
            }
        }

        // Create the report in the Report model
        const report = await ReportModel.create({
            tripId: trip._id,
            totalDistance: totalDistance / 1000, // Convert meters to kilometers
            totalTravelledDuration,
            overSpeedingDuration,
            overSpeedingDistance,
            totalStoppedDuration,
            idleDuration,
        });

        res.json({ reportData: report, gpsData: trip.coordinates });
    } catch (error) {
        console.error("Error fetching report data:", error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
