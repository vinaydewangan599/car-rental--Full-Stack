import User from "../models/User.js";
import fs from "fs";
import imagekit from "../configs/imageKit.js";
import Car from "../models/Car.js";
import Booking from "../models/Booking.js";

//API to change the role of User
export const changeRoleToOwner = async (req, res) => {
  try {
    const { _id } = req.user;
    await User.findByIdAndUpdate(_id, { role: "owner" });
    res.json({ success: true, message: "Now you can list cars" });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};


//api to list the car
 export const addCar = async (req, res) => {
  try {
    const { _id } = req.user;
    let car = JSON.parse(req.body.carData);
    const imageFile = req.file;

    //upload image to imagekit
    const fileBuffer = fs.readFileSync(imageFile.path);
    const response = await imagekit.upload({
      file: fileBuffer, //required
      fileName: imageFile.originalname, //required
      folder: "/cars",
    });
    // optimize through imagekit url transformation
    var optimizedImageUrl = imagekit.url({
        path : response.filePath,
        transformation : [
          {width:'1280'},   //width resizing
          {quality:'auto'}, //auto compression
          {format:'webp'} //format conversion to webp
        ]
    });
    const image = optimizedImageUrl;
    await Car.create({...car, owner: _id, image });

    res.json({ success: true, message: "Car Added" });

  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};


// API to List Owner Cars
export const getOwnerCars = async (req, res) => {
  try {
    const { _id } = req.user;
    const cars = await Car.find({ owner: _id });
    res.json({ success: true, cars });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

//API to toggle car availability
export const toggleCarAvailability = async (req, res) => {
  try {
    const { _id } = req.user;
    const { carId } = req.body;
    const car = await Car.findById(carId);

    // Checking if car belongs to the user
    if (car.owner.toString() !== _id.toString()) {
      return res.json({ success: false, message: "Unauthorized" });
    }

    car.isAvaliable = !car.isAvaliable;
    await car.save();

    res.json({ success: true, message: "Car availability updated"});
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};



//API to delete a car
export const deleteCar = async (req, res) => {
  try {
    const { _id } = req.user;
    const { carId } = req.body;
    const car = await Car.findById(carId);

    // Checking if car belongs to the user
    if (car.owner.toString() !== _id.toString()) {
      return res.json({ success: false, message: "Unauthorized" });
    }

    car.owner = null; // Remove owner reference
    car.isAvaliable = false; // Mark car as unavailable
    await car.save();

    res.json({ success: true, message: "Car Removed"});
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// API to get Dashboard Data
export const getDashboardData = async (req, res) => {
  try {
    const { _id, role } = req.user;

    if (role !== 'owner') {
      return res.json({ success: false, message: "Unauthorized" });
    }

    const cars = await Car.find({ owner: _id });
    const bookings = await Booking.find({ owner: _id }).populate('car').sort({ createdAt: -1 });

    const pendingBookings = await Booking.find({ owner: _id, status: "pending" });
    const completedBookings = await Booking.find({ owner: _id, status: "confirmed" });

    // Calculate monthlyRevenue from bookings where status is confirmed
    const monthlyRevenue = bookings.slice().filter(booking => booking.status === 'confirmed').reduce((acc, booking) => acc + booking.price, 0);
    const dashboardData = {
      totalCars: cars.length,
      totalBookings: bookings.length,
      pendingBookings: pendingBookings.length,
      completedBookings: completedBookings.length,
      recentBookings: bookings.slice(0, 3),
      monthlyRevenue
    };

    res.json({ success: true, dashboardData });

  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

//API to update user image

export const updateUserImage = async (req, res) => {
  try {
    const userId = req.user?._id; // make sure req.user exists
    const imageFile = req.file;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!imageFile) {
      return res.status(400).json({ success: false, message: "No image uploaded" });
    }

    // Upload to ImageKit
    const fileBuffer = fs.readFileSync(imageFile.path);
    const response = await imagekit.upload({
      file: fileBuffer,
      fileName: `${Date.now()}-${imageFile.originalname}`,
      folder: "/users",
    });

    // Optimize ImageKit URL
    const optimizedImageUrl = imagekit.url({
      path: response.filePath,
      transformation: [
        { width: '400' },
        { quality: 'auto' },
        { format: 'webp' }
      ]
    });

    // Save URL in MongoDB
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { image: optimizedImageUrl },
      { new: true } // return updated document
    );

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Return the new URL to frontend
    res.json({ success: true, message: "Image updated", updatedImage: optimizedImageUrl });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};
