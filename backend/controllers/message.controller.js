import { User } from "../models/user.model.js";
import { Message } from "../models/message.model.js";
import { v2 as cloudinary } from "cloudinary";
import { getReceiverSocketId, io } from "../lib/socket.js";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

export const getUsers = async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user._id } });
    if (!users) {
      res.status(400).json({ message: "No users found" });
    }
    res.status(200).json(users);
  } catch (error) {
    res.status(400).json({ message: `Problem at getting users :  ${error}` });
  }
};

export const getUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      res.status(400).json({ message: "No user found" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({ message: `Problem at getting user :  ${error}` });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: receiverId } = req.params;
    const messages = await Message.find({
      $or: [
        { senderId: req.user._id, receiverId },
        { senderId: receiverId, receiverId: req.user._id },
      ],
    });
    res.status(200).json(messages);
  } catch (error) {
    res
      .status(400)
      .json({ message: `Problem at getting messages :  ${error}` });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    let imageUrl;
    if (image) {
      // Upload base64 image to cloudinary
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });
    if (!newMessage) {
      res.status(400).json({ message: "error at Sending message to DB" });
    }

    await newMessage.save();

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
