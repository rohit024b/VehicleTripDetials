// const express = require('express');
// const { getDistance, getSpeed } = require('geolib');
// const auth = require('../middlewares/auth');
// const TripModel = require('../models/trip.model');
// const ReportModel = require('../models/report.model'); // Assuming you've got a report model
// const router = express.Router();

// // Thresholds (adjust based on requirements)
// const SPEED_LIMIT = 60; // km/h for overspeeding threshold
// const TIME_INTERVAL = 2; // seconds between points

// // Generate Report for a Trip
// router.post('/generate/:tripId', auth, async (req, res) => {
//     try {
//         const trip = await TripModel.findById(req.params.tripId);
//         if (!trip) return res.status(404).json({ error: 'Trip not found' });

//         let totalDistance = 0;
//         let totalTravelledDuration = 0;
//         let overSpeedingDuration = 0;
//         let overSpeedingDistance = 0;
//         let totalStoppedDuration = 0;
//         let idleDuration = 0;

//         for (let i = 0; i < trip.coordinates.length - 1; i++) {
//             const start = trip.coordinates[i];
//             const end = trip.coordinates[i + 1];
//             const distance = getDistance(
//                 { latitude: start.latitude, longitude: start.longitude },
//                 { latitude: end.latitude, longitude: end.longitude }
//             );
//             const speed = getSpeed(
//                 { latitude: start.latitude, longitude: start.longitude, time: start.timestamp },
//                 { latitude: end.latitude, longitude: end.longitude, time: end.timestamp }
//             );

//             // Distance Calculation
//             totalDistance += distance;

//             // Determine if the vehicle is moving
//             const isMoving = distance > 0 && start.ignition && end.ignition;

//             if (isMoving) {
//                 totalTravelledDuration += TIME_INTERVAL / 60; // Convert seconds to minutes

//                 // Over Speeding Check
//                 if (speed > SPEED_LIMIT) {
//                     overSpeedingDuration += TIME_INTERVAL / 60;
//                     overSpeedingDistance += distance / 1000; // Convert meters to kilometers
//                 }
//             } else if (start.ignition && !isMoving) {
//                 idleDuration += TIME_INTERVAL / 60; // Ignition on but stationary
//             } else if (!start.ignition) {
//                 totalStoppedDuration += TIME_INTERVAL / 60; // Ignition off
//             }
//         }

//         // Save report data to database
//         const report = await ReportModel.create({
//             tripId: trip._id,
//             totalDistance: totalDistance / 1000, // Convert meters to kilometers
//             totalTravelledDuration,
//             overSpeedingDuration,
//             overSpeedingDistance,
//             totalStoppedDuration,
//             idleDuration,
//         });

//         res.json(report);
//     } catch (error) {
//         console.error("Error generating report:", error);
//         res.status(400).json({ error: 'Error generating report' });
//     }
// });

// module.exports = router;


const express = require('express');
const { getDistance, getSpeed } = require('geolib');
const auth = require('../middlewares/auth');
const TripModel = require('../models/trip.model');
const ReportModel = require('../models/report.model');
const router = express.Router();

const SPEED_LIMIT = 60; // Define the speed limit
const TIME_INTERVAL = 2; // Seconds between each GPS point

// router.post('/generate/:tripId', auth, async (req, res) => {
//     try {
//         // Fetch the trip data with associated coordinates
//         const trip = await TripModel.findById(req.params.tripId).populate('tripId');
//         if (!trip) return res.status(404).json({ error: 'Trip not found' });

//         let totalDistance = 0;
//         let totalTravelledDuration = 0;
//         let overSpeedingDuration = 0;
//         let overSpeedingDistance = 0;
//         let totalStoppedDuration = 0;
//         let idleDuration = 0;

//         const coordinates = trip.coordinates;

//         for (let i = 0; i < coordinates.length - 1; i++) {
//             const start = coordinates[i];
//             const end = coordinates[i + 1];

//             // Calculate distance and speed between consecutive points
//             const distance = getDistance(
//                 { latitude: start.latitude, longitude: start.longitude },
//                 { latitude: end.latitude, longitude: end.longitude }
//             );
//             const speed = getSpeed(
//                 { latitude: start.latitude, longitude: start.longitude, time: start.timestamp },
//                 { latitude: end.latitude, longitude: end.longitude, time: end.timestamp }
//             );

//             // Add to total distance
//             totalDistance += distance;

//             // Check if the vehicle was moving
//             const isMoving = distance > 0 && start.ignition && end.ignition;

//             if (isMoving) {
//                 totalTravelledDuration += TIME_INTERVAL / 60; // Convert seconds to minutes
//                 if (speed > SPEED_LIMIT) {
//                     overSpeedingDuration += TIME_INTERVAL / 60; // Over speed duration
//                     overSpeedingDistance += distance / 1000; // Over speed distance in km
//                 }
//             } else if (start.ignition && !isMoving) {
//                 idleDuration += TIME_INTERVAL / 60; // Ignition on but stationary
//             } else if (!start.ignition) {
//                 totalStoppedDuration += TIME_INTERVAL / 60; // Ignition off, counted as stopped
//             }
//         }

//         // Save calculated metrics to the Report model
//         const report = await ReportModel.create({
//             tripId: trip._id,
//             totalDistance: totalDistance / 1000, // Total distance in kilometers
//             totalTravelledDuration,
//             overSpeedingDuration,
//             overSpeedingDistance,
//             totalStoppedDuration,
//             idleDuration,
//         });

//         res.json(report);
//     } catch (error) {
//         console.error("Error generating report:", error);
//         res.status(400).json({ error: 'Error generating report' });
//     }
// });

// GET report data by trip ID
// router.get('/:tripId', auth, async (req, res) => {
//     try {
//         // Fetch trip data
//         const trip = await TripModel.findById(req.params.tripId).select('coordinates');
//         if (!trip) {
//             return res.status(404).json({ error: 'Trip not found' });
//         }

//         // Perform calculations for the report
//         let totalDistance = 0;
//         let totalTravelledDuration = 0;
//         let overSpeedingDuration = 0;
//         let overSpeedingDistance = 0;
//         let totalStoppedDuration = 0;
//         let idleDuration = 0;

//         // Define your thresholds
//         const SPEED_LIMIT = 60; // km/h for overspeeding threshold
//         const TIME_INTERVAL = 2; // seconds between points

//         for (let i = 0; i < trip.coordinates.length - 1; i++) {
//             const start = trip.coordinates[i];
//             const end = trip.coordinates[i + 1];
//             const distance = getDistance(
//                 { latitude: start.latitude, longitude: start.longitude },
//                 { latitude: end.latitude, longitude: end.longitude }
//             );

//             // Update total distance
//             totalDistance += distance;

//             // Calculate speed
//             const speed = getSpeed(
//                 { latitude: start.latitude, longitude: start.longitude, time: start.timestamp },
//                 { latitude: end.latitude, longitude: end.longitude, time: end.timestamp }
//             );

//             // Determine if the vehicle is moving
//             const isMoving = distance > 0 && start.ignition && end.ignition;

//             if (isMoving) {
//                 totalTravelledDuration += TIME_INTERVAL / 60; // Convert seconds to minutes

//                 // Over Speeding Check
//                 if (speed > SPEED_LIMIT) {
//                     overSpeedingDuration += TIME_INTERVAL / 60;
//                     overSpeedingDistance += distance / 1000; // Convert meters to kilometers
//                 }
//             } else if (start.ignition && !isMoving) {
//                 idleDuration += TIME_INTERVAL / 60; // Ignition on but stationary
//             } else if (!start.ignition) {
//                 totalStoppedDuration += TIME_INTERVAL / 60; // Ignition off
//             }
//         }

//         // Create the report in the Report model
//         const report = await ReportModel.create({
//             tripId: trip._id,
//             totalDistance: totalDistance / 1000, // Convert meters to kilometers
//             totalTravelledDuration,
//             overSpeedingDuration,
//             overSpeedingDistance,
//             totalStoppedDuration,
//             idleDuration,
//         });

//         res.json({ reportData: report, gpsData: trip.coordinates });
//     } catch (error) {
//         console.error("Error fetching report data:", error);
//         res.status(500).json({ error: 'Server error' });
//     }
// });

router.get('/:tripId', auth, async (req, res) => {
    try {
        // Fetch trip data
        const trip = await TripModel.findById(req.params.tripId).select('coordinates');
        if (!trip) {
            return res.status(404).json({ error: 'Trip not found' });
        }

        // Check if a report already exists for this trip
        const existingReport = await ReportModel.findOne({ tripId: trip._id });
        if (existingReport) {
            // If a report exists, return the existing report and gps data
            return res.json({ reportData: existingReport, gpsData: trip.coordinates });
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

            // Calculate speed
            const speed = getSpeed(
                { latitude: start.latitude, longitude: start.longitude, time: start.timestamp },
                { latitude: end.latitude, longitude: end.longitude, time: end.timestamp }
            );

            // Determine if the vehicle is moving
            const isMoving = distance > 0 && start.ignition && end.ignition;

            if (isMoving) {
                totalTravelledDuration += TIME_INTERVAL / 60; // Convert seconds to minutes

                // Over Speeding Check
                if (speed > SPEED_LIMIT) {
                    overSpeedingDuration += TIME_INTERVAL / 60;
                    overSpeedingDistance += distance / 1000; // Convert meters to kilometers
                }
            } else if (start.ignition && !isMoving) {
                idleDuration += TIME_INTERVAL / 60; // Ignition on but stationary
            } else if (!start.ignition) {
                totalStoppedDuration += TIME_INTERVAL / 60; // Ignition off
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
