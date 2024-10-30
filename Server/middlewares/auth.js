const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");


const auth = async (req, res, next) => {
    //getting token from headers and splitting it by the space and accessing 1st index element
    const token = req.headers?.authorization?.split(" ")[1];
    if (!token) {
        return res.status(403).send("Acess denied no token provided!")
    }

    try {
        //verifying the token
        const decoded = jwt.verify(token, process.env.SECRET_KEY) //token has _id, role
        /*
        decode will give us 
        {
            _id: user._id, this _id we are finding in line 22
        }
        */

        //here we are finding the _id from decoded into the userMOdelDB to the req.user
        // now req.user = user data from databae {name, ID, password, phone, role}
        req.user = await userModel.findById(decoded._id) //it is checking into the mongoDB for the userID:_id
        next();
    } catch (err) {
        res.status(400).send("Invalid Token!")
    }
}

module.exports = auth