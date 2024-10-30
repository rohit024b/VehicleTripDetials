import React from 'react'
import '../Navbar/Navbar.css'

const Navbar = () => {
    const token = localStorage.getItem('token');

    //logout
    const handleLogout=()=>{
        try {
            if (token) {
                localStorage.removeItem('token');
                localStorage.removeItem('userId');
                // Optionally redirect the user to the login page
                window.location.href = '/';
            }
        } catch (error) {
            console.log(error)
        }
    }
  return (
    <div>
        <header className="header">
                <div className='headercntainer'>
                    <div className='leftheader'>
                        <img
                            src="https://cdn-icons-png.flaticon.com/512/39/39871.png"
                            alt="Speedo logo"
                            className="logo"
                        />
                        <span>Speedo</span>
                    </div>
                    <div className='rightHeader'>
                        <button onClick={handleLogout} className='logOutBtn'>
                            Logout
                        </button>
                    </div>
                </div>
            </header>
    </div>
  )
}

export default Navbar