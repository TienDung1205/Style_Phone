const mongoose = require("mongoose");

const registerSchema = new mongoose.Schema(
    {
        fullName: String,
        email: String,
        password: String,
        otp: String,
        expireAt: {
            type: Date,
            expires: 120
        }
    },
    {
        timestamps: true
    }
);

const Register = mongoose.model("Register", registerSchema, "register");

module.exports = Register;