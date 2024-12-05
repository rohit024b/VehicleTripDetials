# GPS Vehicle Trip Tracker

This project is a **MERN stack application** designed to track and analyze vehicle trips using GPS data. It provides features for uploading trip data, visualizing routes on a map, and generating reports with key insights such as stoppage times, idle durations, and more. 

---

## Features

### 1. **User Authentication**
- **Sign-Up Page:** New users can register by providing a valid email address and an 8-character password.  
- **Login Page:** Registered users can log in using their credentials.

### 2. **File Upload and Trip Management**
- **Home Page:**
  - Upload CSV files containing latitude, longitude, timestamps, and ignition data for vehicle trips.
  - Manage multiple trips:
    - View a list of uploaded trips.
    - Delete multiple trips at once.
  - After uploading, wait for 2 seconds to see the updated list of trips.
  - Click the **"Open"** button on a trip to view its details and report.

### 3. **Trip Visualization and Reporting**
- **Trip Report Page:**
  - Visualize the vehicle's route on a map from start to endpoint.
  - See a detailed trip report below the map, including:
    - Total distance traveled.
    - Stoppage and idle durations.
    - Overspeeding metrics (if applicable).

---

## Tech Stack

- **Frontend:** React.js, Leaflet (for map visualization).
- **Backend:** Node.js, Express.js.
- **Database:** MongoDB.
- **Libraries/Tools:**
  - `geolib` for distance calculations.
  - CSV parsing for GPS data.
  - React Router for navigation.

---

## Installation and Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/vehicle-trip-tracker.git
   
2. Navigate to the project directory:
  ```bash
  cd vehicle-trip-tracker
  ```
3. Install dependencies for both backend and frontend:
  ```bash
  cd backend && npm install
  cd ../frontend && npm install
  ```
4. Start the application:
Backend:
  ```bash
  cd backend && npm run dev
  ```
Frontend:
  ```bash
  cd frontend && npm start
  ```

5. Access the app at http://localhost:3000.


Screenshots
1. Sign-Up Page
New users can register with a valid email and 8-character password.
![Alt Text](https://i.imgur.com/aAYVCAm.png)


3. Login Page
Existing users can log in with valid credentials.
![Alt Text](https://i.imgur.com/gRLx2Ft.png)

4. Home Page
Upload CSV files containing vehicle trip data, view the list of trips, delete multiple trips, and navigate to the trip report page.
csv file - https://drive.google.com/file/d/1NTLjSVOZdXMviFlGXD5OWpAaKPdgmzoM/view?usp=sharing
![Alt Text](https://i.imgur.com/uusInBI.png)


6. Trip Report Page
Visualize trip routes on the map and view detailed trip reports below.
![Alt Text](https://i.imgur.com/RBKlNOG.png)


## How to Use
- **Sign Up or Log In:**
  - Navigate to the Sign-Up Page if you're a new user.
  - Log in to your account if you already have one.
- **Upload Trip Data:**
  - On the Home Page, upload CSV files containing trip details (latitude, longitude, timestamp, and ignition data).
  - Wait for 2 seconds after uploading to see the updated trip list.
- **Manage Trips:**
  - View the list of uploaded trips.
  - Delete multiple trips if needed.
  - Click Open to view trip details.
- **View Trip Details:**
  - On the Trip Report Page, view the vehicle's route on the map and detailed trip data below.

### Let me know if you'd like any changes or additional sections! 😊
