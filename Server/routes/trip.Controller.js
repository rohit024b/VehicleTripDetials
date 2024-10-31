const express = require('express');
const multer = require('multer');
const csvParser = require('csv-parser');
const fs = require('fs');
const auth = require('../middlewares/auth');
const TripModel = require('../models/trip.model');
const { getDistance } = require('geolib'); 
const router = express.Router();
const upload = multer({ dest: 'uploads/' });


// GET a trip by ID
router.get('/:id', auth, async (req, res) => {
    try {
        const trip = await TripModel.findById(req.params.id);
        if (!trip) {
            return res.status(404).json({ error: 'Trip not found' });
        }

        res.json(trip);
    } catch (error) {
        console.error("Error fetching trip data:", error);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET All Trips for the Authenticated User
router.get('/', auth, async (req, res) => {
    try {
        const trips = await TripModel.find({ userId: req.user._id });
        res.status(200).json({ data: trips });
    } catch (error) {
        res.status(400).json({ error: 'Error fetching trips', details: error.message });
    }
});

router.post('/uploadCsv', auth, upload.single('file'), async (req, res) => {
    const { name } = req.body;

    if (!name) {
        return res.status(400).json({ error: 'Trip name is required.' });
    }
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded.' });
    }

    const coordinates = [];
    const trip = new TripModel({ name, userId: req.user._id });

    const parseCsv = () => {
        return new Promise((resolve, reject) => {
            fs.createReadStream(req.file.path) //file path to read
                .pipe(csvParser())
                .on('data', (row) => {
                    const { latitude, longitude, timestamp, ignition } = row;
                    const ignitionValue = ignition === 'on' ? true : ignition === 'off' ? false : Boolean(ignition);

                    coordinates.push({
                        latitude: parseFloat(latitude),
                        longitude: parseFloat(longitude),
                        timestamp: new Date(timestamp),
                        ignition: ignitionValue,
                    });
                })
                .on('end', resolve)
                .on('error', reject);
        });
    };

    try {
        await parseCsv();

        let totalDistance = 0;
        for (let i = 0; i < coordinates.length - 1; i++) {
            const point1 = { latitude: coordinates[i].latitude, longitude: coordinates[i].longitude };
            const point2 = { latitude: coordinates[i + 1].latitude, longitude: coordinates[i + 1].longitude };
            totalDistance += getDistance(point1, point2);
        }

        trip.coordinates = coordinates;
        trip.totalDistance = (totalDistance / 1000).toFixed(2); // Store as kilometers with 2 decimal places
        await trip.save();

        fs.unlink(req.file.path, (err) => { 
            if (err) console.error('Error deleting file:', err);
        });

        res.status(200).json({ message: 'CSV data uploaded successfully', trip });
    } catch (error) {
        fs.unlink(req.file.path, (err) => {
            if (err) console.error('Error deleting file:', err);
        });
        res.status(400).json({ error: 'Error uploading CSV data', details: error.message });
    }
});

// In your trips route file
router.post('/delete', auth, async (req, res) => {
    const { tripIds } = req.body;

    if (!tripIds || !tripIds.length) {
        return res.status(400).json({ error: 'No trips selected for deletion.' });
    }

    try {
        await TripModel.deleteMany({ _id: { $in: tripIds }, userId: req.user._id });
        res.status(200).json({ message: 'Selected trips deleted successfully.' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting trips', details: error.message });
    }
});

module.exports = router;
