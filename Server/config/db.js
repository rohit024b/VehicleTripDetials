const mongoose = require("mongoose")
require('dotenv').config();

const startTheDB = async()=>{
    try {
        await mongoose.connect(process.env.DATABASE_URI)
        console.log("Connected to DB")
    } catch (err) {
        console.log(err, "Error connecting the DataBase")
    }
}


module.exports = startTheDB