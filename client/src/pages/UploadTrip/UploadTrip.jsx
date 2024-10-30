import React, { useState, useEffect } from 'react';
import '../UploadTrip/UploadTrip.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const UploadTrip = () => {
    const [showPopup, setShowPopup] = useState(false);
    const [tripName, setTripName] = useState('');
    const [file, setFile] = useState(null);
    const [trips, setTrips] = useState([]); // State for storing trips
    const [selectedTrips, setSelectedTrips] = useState({}); // State for storing selected trips
    const token = localStorage.getItem('token');

    const navigate = useNavigate()
    useEffect(() => {
        const fetchTrips = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/trips`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });
                setTrips(response.data.data);
            } catch (error) {
                console.error("Error fetching trips:", error);
            }
        };

        fetchTrips();
    }, [token]);

    const handleFileChange = () => {
        setShowPopup(true);
    };

    const handleClosePopup = () => {
        setShowPopup(false);
        setTripName('');
        setFile(null);
    };

    const handleFileUpload = (event) => {
        const selectedFile = event.target.files[0];
        setFile(selectedFile);
    };

    const handleSave = async () => {
        if (!file || !tripName) {
            alert("Please provide both trip name and CSV file.");
            return;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('name', tripName); // Send trip name here

        try {
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/trips/uploadCsv`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`,
                },
            });
            // console.log(response)
            alert("Trip data uploaded successfully!");
            setFile(null);
            setTripName('')
            setShowPopup(false);
            setTimeout(async () => {

                // Refresh the trips after saving
                const updatedTripsResponse = await axios.get(`${process.env.REACT_APP_API_URL}/trips`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });
                setTrips(updatedTripsResponse.data.data); // Update the trips state here
            }, 1000);
        } catch (error) {
            console.error("Error uploading trip data:", error);
            alert("Error uploading trip data.");
        }

    };

    //delete trip's
    const handleTripSelect = (tripId) => {
        setSelectedTrips(prev => ({
            ...prev,
            [tripId]: !prev[tripId],
        }));
    };

    const handleTripDelete = async () => {
        const selectedTripIds = Object.keys(selectedTrips).filter((tripId) => selectedTrips[tripId]);

        if (selectedTripIds.length === 0) {
            alert("Please select at least one trip to delete.");
            return;
        }
        console.log(selectedTripIds)
        try {
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/trips/delete`, {
                tripIds: selectedTripIds
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.status === 200) {
                alert("Selected trips deleted successfully!");
                setTrips(trips.filter(trip => !selectedTripIds.includes(trip._id)));
                setSelectedTrips({});
            }
        } catch (error) {
            console.error("Error deleting trips:", error);
            alert("Error deleting selected trips.");
        }
    };

    //handelling open a trip in GPS
    const handleOpenTrip = async () => {
        const selectedTripId = Object.keys(selectedTrips).find(id => selectedTrips[id]);

        if (!selectedTripId) {
            alert("Please select one trip to view GPS data.");
            return;
        }

        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/trips/${selectedTripId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            // console.log(response.data)
            if (response.data) {
                navigate(`/gps/${selectedTripId}`, { state: { gpsData: response.data } });
            }
        } catch (error) {
            console.error("Error fetching GPS data:", error);
        }
    };
    // console.log(tripName)


    return (
        <div className="upload-trip-container">
            <div className="welcome-message">
                <span role="img" aria-label="wave">👋</span>
                Welcome, User
            </div>
            <div className="upload-box">
                <img src="https://i.imgur.com/BBqrGrT.jpeg" alt="Upload Trip Illustration" className={trips?.length == 0 ? "trip-image" : "trip-image2"} />
                <button onClick={handleFileChange} className="upload-button">Upload Trip</button>
                <p className="upload-description">
                    Upload the <span className="highlight">Excel sheet</span> of your trip
                </p>
            </div>

            {showPopup && (
                <div className="popup-overlay">
                    <div className="popup">
                        <input
                            type="text"
                            placeholder="Enter trip name"
                            className="trip-name-input"
                            value={tripName}
                            required
                            onChange={(e) => setTripName(e.target.value)}
                        />
                        <label className="file-upload-label">
                            <i style={{ fontSize: "30px", margin: '15px' }} className='bx bx-upload'></i>
                            <span>Click here to upload the CSV of your trip</span>
                            <input
                                type="file"
                                accept=".csv"
                                className="file-input"
                                onChange={handleFileUpload}
                            />
                        </label>
                        <div className="popup-buttons">
                            <button onClick={handleClosePopup} className="cancel-button">Cancel</button>
                            <button onClick={handleSave} className="save-button">Save</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="your-trips-section">
                <span className='tripsHeader'>
                    <h2 style={{ padding: '10px' }}>Your Trips</h2>
                    <span style={{ display: 'flex', gap: '25px' }}>
                        <button onClick={handleTripDelete} className='tripActionBtns tripDelete'>Delete</button>
                        <button onClick={handleOpenTrip} className='tripActionBtns tripOpen'>Open</button>
                    </span>
                </span>
                {trips?.map((trip, index) => (
                    <div key={index} className="trip-item">
                        <input
                            type="checkbox"
                            checked={!!selectedTrips[trip._id]}
                            onChange={() => handleTripSelect(trip._id)}
                        />
                        <label>{trip.name}</label>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default UploadTrip;
