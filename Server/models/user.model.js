const mongoose = require('mongoose');
const ROLES = require('../constants/roles');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, match: [/.+\@.+\..+/, 'Please provide a valid email address'] },
    password: { type: String, required: true, minlength: 8},
    role: { type: String, enum: [ROLES.ADMIN, ROLES.SELLER, ROLES.USER], default: ROLES.USER },

},
    {
        timestamps: true, versionKey: false
    }
)

module.exports = mongoose.model("user", userSchema);