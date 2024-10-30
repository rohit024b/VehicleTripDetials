require('dotenv').config();
const express = require('express')
const app = express()
const cors = require("cors");
const startTheDB = require('./config/db');
const userRouter = require('./routes/user.controlelr');
const triprouter = require('./routes/trip.Controller');
const reportrouter = require('./routes/report.controller');


app.use(express.json())


// Use CORS middleware
app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true
}));



//health-check route
app.get("/", (req, res)=>{
    res.send("200 OK")
})

//routes
app.use('/user',userRouter)
app.use('/trips', triprouter);
// app.use('/coordinates', coordinaterouter);
app.use('/reports', reportrouter);



app.listen(process.env.PORT, async()=>{
    await startTheDB()
    console.log(`Hello from ${process.env.PORT}`)
})