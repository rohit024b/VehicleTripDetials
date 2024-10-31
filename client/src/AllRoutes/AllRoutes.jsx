import React from 'react'

import { Route, Routes, useNavigate } from 'react-router-dom'
import ErrorPage from '../pages/isError/ErrorPage'
import UploadTrip from '../pages/UploadTrip/UploadTrip'
import Login from '../pages/Login/LoginA'
import PrivateRoutes from './PrivateRoutes'
import GpsData from '../pages/GpsData/GpsData'
import Navbar from '../pages/Navbar/Navbar'
import SignUp from '../pages/Signup/SignUp'



const AllRoutes = () => {
    const token = localStorage.getItem('token');

    return (
        <>
            {token ? <Navbar /> : ""}
            <Routes>
                <Route path='/login' element={token ? null : <Login />} />
                <Route path='/signup' element={token ? null : <SignUp />} />
                <Route path='/' element={<PrivateRoutes><UploadTrip /></PrivateRoutes>} />
                <Route path='*' element={<PrivateRoutes><ErrorPage /></PrivateRoutes>} />
                <Route path="/gps/:id" element={<PrivateRoutes><GpsData /></PrivateRoutes>} />
            </Routes>
        </>
    )
}

export default AllRoutes