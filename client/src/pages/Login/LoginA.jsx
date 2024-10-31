import React, { useState } from 'react';
import '../Login/Login.css';
import axios from 'axios'
import { useNavigate } from 'react-router-dom';


const Login = () => {

  const token = localStorage.getItem('token');
  const [error, setError] = useState("");
  const navigate = useNavigate()

  const [data, setData] = useState({
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/user/login`, data);
      if (response.status === 200) {
        localStorage.setItem("token", response.data.token); // Saving token to local storage
        localStorage.setItem("userId", response.data.userId);
        alert("You are successfully logged in!")
        navigate("/")
      }
    } catch (err) {
      if (err.response) {
        // If the response is available, extract the error message
        setError(err.response.data || "An error occurred");
      } else {
        setError("Login failed. Please try again.");
      }
    }
  };

  const handleSignUp = () => {
    navigate('/signup')
    console.log('Redirect to Sign Up page');
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div style={{
          height: '55px',
          margin: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '5px'
        }}>
          <img
            src="https://i.imgur.com/dmr2UXU.png"
            alt="Speedo logo"
            className="logos"
          />
          <h2 className='logoName'>Speedo</h2>
        </div>
        <form onSubmit={handleSubmit}>
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
            Sign in
          </button>

          <p>Dont have an account?</p>
          <button type="button" className="signup-button" onClick={handleSignUp}>
            <b>Sign Up</b>
          </button>

          {error && <p className="text-red-500 text-center">{error}</p>}
        </form>
      </div>
    </div>
  );
};

export default Login
