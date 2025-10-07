import User from "../models/User.js";  
import bcrypt from "bcrypt";  
import jwt from "jsonwebtoken";
import Car from "../models/Car.js";



//generate token
const generateToken = (userId) => {
    const payload = userId;
    return jwt.sign(payload, process.env.JWT_SECRET);
};

//register user
export const registerUser = async (req, res) => {
    try {
        const {name, email, password} = req.body;

        if(!name || !email || !password || password.length < 8) {
            return res.status(400).json({success: false, message: "All fields are required" });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({success: false, message: "User already exists" });
        }
        //hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({ name, email, password: hashedPassword });
        const token = generateToken(user._id.toString());
        res.status(201).json({success: true, token });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ success: false, message: error.message });
    }
}


//user login

export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;   
        const user = await User.findOne({email});

        if(!user){
            return res.status(200).json({ success: false, message: "User not found" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(200).json({ success: false, message: "Invalid credentials" });
        }

        const token = generateToken(user._id.toString());
        res.status(200).json({ success: true, token });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

//get user data using Token (JWT)
export const getUserData = async (req, res) => {
    try {
       const {user} = req;
       res.json({success: true, user})

    } catch (error) {
        console.log(error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get All Cars for the Frontend
export const getCars = async (req, res) => {
  try {
    const cars = await Car.find({isAvaliable: true})
    res.json({success: true, cars})
  } catch (error) {
    console.log(error.message);
    res.json({success: false, message: error.message})
  }
}