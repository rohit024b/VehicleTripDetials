import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { MapContainer, TileLayer, Polyline, Marker, Popup } from 'react-leaflet';
import axios from 'axios';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getDistance, getSpeed } from 'geolib';
import '../GpsData/GpsData.css'

const GpsData = () => {
    const { id } = useParams();
    const location = useLocation();
    const [gpsData, setGpsData] = useState(Array.isArray(location.state?.gpsData) ? location.state.gpsData : []);
    const [reportData, setReportData] = useState(null);
    const token = localStorage.getItem('token');
    const mapRef = useRef();
    const [processedGpsData, setProcessedGpsData] = useState([]);
    const [tripName, setTripName] = useState()
    const stoppageIcon = new L.Icon({ iconUrl: 'https://i.imgur.com/qM7sVer.png', iconSize: [35, 35] });
    const idleIcon = new L.Icon({ iconUrl: 'https://i.imgur.com/qM7sVer.png', iconSize: [35, 35] });
    const redIcon = new L.Icon({ iconUrl: 'https://i.imgur.com/wqpu6FH.png', iconSize: [40, 40] });
    const overSpeed = new L.Icon({ iconUrl: 'https://i.imgur.com/wqpu6FH.png', iconSize: [40, 40] });
    const [currentPage, setCurrentPage] = useState(1);


    useEffect(() => {
        const fetchGpsData = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/reports/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });
                setTripName(location.state.gpsData.name)
                setGpsData(Array.isArray(response.data.gpsData) ? response.data.gpsData : []);
                setReportData(response.data.reportData);
            } catch (error) {
                console.error("Error fetching GPS data:", error);
            }
        };

        if (!gpsData.length) fetchGpsData();
    }, [id, gpsData, token]);

    useEffect(() => {
        if (Array.isArray(gpsData) && gpsData.length > 0 && mapRef.current) {
            const bounds = L.latLngBounds(gpsData.map(point => [point.latitude, point.longitude]));
            mapRef.current.flyToBounds(bounds, {
                duration: 1.5, // Duration in seconds
                easeLinearity: 0.25 // Controls the animation curve (0 is slowest, 1 is fastest)
            });
        }
    }, [gpsData]);


    const SPEED_LIMIT = 60;

    useEffect(() => {
        if (!Array.isArray(gpsData) || gpsData.length === 0) return;

        let totalStoppedDuration = 0;
        let idleDuration = 0;
        let overSpeedingDuration = 0;
        let overSpeedingDistance = 0;

        let isStoppage = false;
        let isIdle = false;
        let isOverspeeding = false;
        let stoppageStartTime = null;
        let idleStartTime = null;
        let overspeedingStartTime = null;
        let prevPoint = null;

        // const IDLE_THRESHOLD = 1 * 60 * 1000; // Minimum idle duration in milliseconds (e.g., 1 minutes)
        const processedData = gpsData.map((point, index) => {
            const nextPoint = gpsData[index + 1];
            let currentDistance = 0;
            let currentSpeed = 0;

            if (prevPoint && nextPoint) {
                currentDistance = getDistance(
                    { latitude: prevPoint.latitude, longitude: prevPoint.longitude },
                    { latitude: point.latitude, longitude: point.longitude }
                );

                currentSpeed = getSpeed(
                    { latitude: prevPoint.latitude, longitude: prevPoint.longitude, time: prevPoint.timestamp },
                    { latitude: point.latitude, longitude: point.longitude, time: point.timestamp }
                );

                // Stoppage calculation
                if (!point.ignition && !isStoppage) {
                    isStoppage = true;
                    stoppageStartTime = point.timestamp;
                } else if (point.ignition && isStoppage) {
                    totalStoppedDuration += (point.timestamp - stoppageStartTime) / 60000;
                    isStoppage = false;
                }

                // Idle calculation with duration threshold
                if (point.ignition && currentSpeed === 0 && currentDistance === 0 && !isIdle) {
                    isIdle = true;
                    idleStartTime = point.timestamp;
                } else if (currentSpeed > 0 && isIdle) {
                    idleDuration += (point.timestamp - idleStartTime) / 60000;
                    isIdle = false;
                }
                if (currentSpeed > SPEED_LIMIT && !isOverspeeding) {
                    isOverspeeding = true;
                    overspeedingStartTime = point.timestamp;
                } else if (currentSpeed <= SPEED_LIMIT && isOverspeeding) {
                    overSpeedingDuration += (point.timestamp - overspeedingStartTime) / 60000;
                    overSpeedingDistance += currentDistance;
                    isOverspeeding = false;
                }
            }

            prevPoint = point;

            return {
                ...point,
                isStoppage,
                isIdle,
                isSpeeding: currentSpeed > SPEED_LIMIT,
            };
        });

        setProcessedGpsData(processedData);

        setReportData((prevReportData) => ({
            ...prevReportData,
            totalStoppedDuration: totalStoppedDuration || 0, // Ensure a fallback value
            idleDuration: idleDuration || 0, // Ensure a fallback value
            overSpeedingDuration,
            overSpeedingDistance,
        }));
    }, [gpsData]);

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        })
    };

    const rowsPerPage = 5; // Set the number of rows you want to display per page

    // Calculate the total number of pages
    const totalPages = Math.ceil(gpsData.length / rowsPerPage);

    // Slice the gpsData based on the current page
    const indexOfLastData = currentPage * rowsPerPage;
    const indexOfFirstData = indexOfLastData - rowsPerPage;
    const currentData = gpsData.slice(indexOfFirstData, indexOfLastData);

    // Pagination
    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };


    return (
        <>
            <div style={{ width: "100%", display: 'flex', flexDirection: 'column', alignContent: 'center', alignItems: 'center' }}>
                <div className='tripName'>
                    <h4>{tripName}</h4>
                </div>

                <div className='mapData'>
                    <span><img className='mapicons' src="https://i.imgur.com/qM7sVer.png" alt="" /> Stopped</span>
                    <span><img className='mapicons' src="https://i.imgur.com/rTZaeNr.png" alt="" /> Idle</span>
                    <span><img className='mapicons' src="https://i.imgur.com/Ib4YdpI.png" alt="" /> Over Speeding</span>
                </div>
                <div style={{ height: "400px", width: "100%", display: 'flex', flexDirection: 'column', alignContent: 'center', alignItems: 'center' }}>
                    <MapContainer className='mapContainer' ref={mapRef} center={[0, 0]} zoom={10} style={{ height: "100%", width: "80%" }}>
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                        {processedGpsData.length > 0 && (
                            <>
                                <Polyline positions={processedGpsData.map(point => [point.latitude, point.longitude])} color="blue" />

                                <Marker position={[processedGpsData[0].latitude, processedGpsData[0].longitude]} icon={redIcon}>
                                    <Popup>Start Point</Popup>
                                </Marker>

                                <Marker position={[processedGpsData[processedGpsData.length - 1].latitude, processedGpsData[processedGpsData.length - 1].longitude]} icon={redIcon}>
                                    <Popup>End Point</Popup>
                                </Marker>

                                {processedGpsData.map((point, index) => (
                                    point.isStoppage ? (
                                        <Marker key={index} position={[point.latitude, point.longitude]} icon={stoppageIcon}>
                                            <Popup>Stoppage at {new Date(point.timestamp).toLocaleString()}</Popup>
                                        </Marker>
                                    ) : point.isIdle ? (
                                        <Marker key={index} position={[point.latitude, point.longitude]} icon={idleIcon}>
                                            <Popup>Idle at {new Date(point.timestamp).toLocaleString()}</Popup>
                                        </Marker>
                                    ) : point.isSpeeding ? (
                                        <Marker key={index} position={[point.latitude, point.longitude]} icon={overSpeed}>
                                            <Popup>Overspeeding at {new Date(point.timestamp).toLocaleString()}</Popup>
                                        </Marker>
                                    ) : null
                                ))}
                            </>
                        )}

                    </MapContainer>
                </div>

                {reportData && (
                    <div className='reportOfData'>
                        <div className='reprtCards' >
                            <div>
                                <img src="https://i.imgur.com/xbqWVap.png" width={'30px'} alt="" />
                            </div>
                            <p><b>{reportData.totalDistance} km</b> <br />Total Distance</p>
                        </div>
                        <div className='reprtCards' >
                            <div>
                                <img src="https://i.imgur.com/BoJFS11.png" width={'30px'} alt="" />
                            </div>
                            <p><b>{reportData.totalTravelledDuration.toFixed(1)} mins</b><br />Total Travelled Duration</p>
                        </div>
                        <div className='reprtCards' >
                            <div>
                                <img src="https://i.imgur.com/G85B7KF.png" width={'30px'} alt="" />
                            </div>
                            <p><b>{reportData.overSpeedingDistance} Km</b><br />Over Speeding Distance</p>
                        </div>
                        <div className='reprtCards' >
                            <div>
                                <img src="https://i.imgur.com/G85B7KF.png" width={'30px'} alt="" />
                            </div>
                            <p><b>{reportData.idleDuration} mins</b><br />Over Speeding Duration</p>
                        </div>
                        <div className='reprtCards' >
                            <div>
                                <img src="https://i.imgur.com/aOVHmjX.png" width={'30px'} alt="" />
                            </div>
                            <p><b>{reportData.totalStoppedDuration} mins</b><br />Stopped Duration</p>
                        </div>
                    </div>
                )}

            </div>

            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <h2>GPS Data Table</h2>
                <table style={{ width: '100%', maxWidth: '80%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr>
                            <th style={headerStyle}>Time</th>
                            <th style={headerStyle}>Point</th>
                            <th style={headerStyle}>Ignition</th>
                            <th style={headerStyle}>Speed</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentData.map((point, index) => (
                            <tr key={index}>
                                <td style={cellStyle}>
                                    {formatTime(point.timestamp)} to {formatTime(point.timestamp)}
                                </td>
                                <td style={cellStyle}>
                                    {point.latitude.toFixed(4)}° N, {point.longitude.toFixed(4)}° W
                                </td>
                                <td style={{ color: point.ignition ? 'green' : 'red', textAlign: 'center', border: '1px solid #ddd' }}>
                                    {point.ignition ? 'ON' : 'OFF'}
                                </td>
                                <td style={cellStyle}>
                                    {point.speed} KM/H
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div style={{ marginTop: '20px' }}>
                    <button onClick={handlePreviousPage} disabled={currentPage === 1}>
                        Previous
                    </button>
                    <span style={{ margin: '0 10px' }}>
                        Page {currentPage} of {totalPages}
                    </span>
                    <button onClick={handleNextPage} disabled={currentPage === totalPages}>
                        Next
                    </button>
                </div>
            </div>
        </>
    );
};

const headerStyle = {
    padding: '10px',
    border: '1px solid #ddd',
    backgroundColor: 'white',
};

const cellStyle = {
    width: '300px',
    height: '100px',
    padding: '10px',
    border: '1px solid #ddd',
    textAlign: 'center',
};

export default GpsData;
