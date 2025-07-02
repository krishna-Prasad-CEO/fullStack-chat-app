import bcrypt from "bcryptjs";
import { User } from "../models/user.model.js";
import generateToken from "../lib/utils.js";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

export const signUp = async (req, res) => {
  const { fullName, email, password } = req.body;
  try {
    if (!fullName || !email || !password) {
      res.status(400).json({ message: "All fields are required to signUp" });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.findOne({ email });
    if (user) res.status(400).json({ message: "User already exists" });

    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
    });

    if (newUser) {
      generateToken(newUser._id, res);
    }

    await newUser.save();
    res.status(200).json({ message: "User created Successfully" });
  } catch (error) {
    res.status(500).json({ message: `Problem at Creating User :  ${error}` });
  }
};

export const logIn = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      res.status(400).json({ message: "All fields are required to logIn" });
    }
    const user = await User.findOne({ email });
    if (user && (await bcrypt.compare(password, user.password))) {
      generateToken(user._id, res);
      res.status(200).json({ message: "User logged in Successfully" });
    } else {
      res.status(400).json({ message: "Invalid password or email" });
    }
  } catch (error) {
    res.status(500).json({ message: `Problem at Logging In :  ${error}` });
  }
};

export const logOut = (req, res) => {
  try {
    res.cookie("jwt", "", {
      maxAge: 0,
    });
    res.status(200).json({ message: "User logged out Successfully" });
  } catch (error) {
    res.status(500).json({ message: `Problem at Logging Out :  ${error}` });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { profilePic } = req.body;
    const userId = req.user._id;

    if (!profilePic) {
      res.status(400).json({ message: "Profile picture is required" });
    }

    const uploadResponse = await cloudinary.uploader.upload(profilePic);
    if (!uploadResponse) {
      res.status(400).json({ message: "Profile picture upload failed" });
    }
    const user = await User.findByIdAndUpdate(
      userId,
      { profilePic: uploadResponse.secure_url },
      { new: true }
    );

    if (!user) {
      res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "Profile picture updated successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: `Problem at Updating Profile :  ${error}` });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      res.status(404).json({ message: "User not found for deleting account" });
    }
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {}
};

export const checkAuth = async (req, res) => {
  res.status(200).json(req.user);
};
