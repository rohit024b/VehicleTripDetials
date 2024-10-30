import React, { useState } from 'react';
import '../Login/Login.css';
import axios from 'axios'
import { useNavigate } from 'react-router-dom';
const SignUp = () => {
    const token = localStorage.getItem('token');

    const [data, setData] = useState({
        name:"",
        email: "",
        password: ""
    });

    const handleForm = (e) => {
        const { value, name } = e.target;

        setData(prev => {
            return {
                ...prev,
                [name]: value
            }
        })
    };

    // console.log(data)
    const [error, setError] = useState("");
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/user/register`, data);
            if (response.status === 201) {
                alert("Signed-up successfully, login please!!")
                navigate("/login")
            }
        } catch (err) {
            if (err.response) {
                // If the response is available, extract the error message
                setError(err.response.data || "An error occurred");
            } else {
                setError("Signup failed. Please try again.");
            }
        }
    };


    return (
        <div className="login-container">
            <div className="login-card">
                <img
                    src="https://cdn-icons-png.flaticon.com/512/39/39871.png"
                    alt="Speedo logo"
                    className="logo"
                />
                <h2>Speedo</h2>
                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label htmlFor="name"><b>Name</b></label>
                        <input
                            name='name'
                            type="name"
                            id="name"
                            placeholder="Your Name"
                            value={data.name}
                            onChange={(e) => handleForm(e)}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <label htmlFor="email"><b>Email</b></label>
                        <input
                            name='email'
                            type="email"
                            id="email"
                            placeholder="Example@email.com"
                            value={data.email}
                            onChange={(e) => handleForm(e)}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <label htmlFor="password"><b>Password</b></label>
                        <input
                            name='password'
                            type="password"
                            id="password"
                            placeholder="At least 8 characters"
                            value={data.password}
                            onChange={(e) => handleForm(e)}
                            minLength="8"
                            required
                        />
                    </div>
                    <button type="submit" className="sign-in-button">
                        Sign Up
                    </button>

                    {error && <p className="text-red-500 text-center">{error}</p>}
                </form>
            </div>
        </div>
    );
};

export default SignUp