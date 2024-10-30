import pkg from "jsonwebtoken";
const { sign } = pkg;
import { compare } from "bcrypt";
import User from "../models/UserModel.js";
import { existsSync, mkdirSync, renameSync, unlinkSync } from "fs";
import path from "path";

const maxAge = 3 * 24 * 60 * 60 * 1000; // 3 days in milliseconds

const createToken = (email, userId) => {
  return sign({ email, userId }, process.env.JWT_KEY, {
    expiresIn: maxAge,
  });
};

export const signup = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check if email and password are provided
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    // Create the user in the database
    const user = await User.create({ email, password });

    // Create a JWT token
    const token = createToken(email, user.id);

    res.cookie("jwt", token, {
      maxAge,
      httpOnly: true, // More secure for authentication tokens
    });

    // Send a success response
    res.status(201).json({
      User: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        image: user.image,
        color: user.color,
        profileSetup: user.profileSetup,
      },
    });
  } catch (error) {
    console.error("Error during signup:", error);
    res.status(500).json({ message: "Failed to sign up" });
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check if email and password are provided
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    // Find the user in the database
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Compare passwords
    const isMatch = await compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Create a JWT token
    const token = createToken(email, user.id);

    res.cookie("jwt", token, {
      maxAge,
      httpOnly: true,
    });

    // Send a success response
    res.status(201).json({
      User: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        image: user.image,
        color: user.color,
        profileSetup: user.profileSetup,
      },
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Failed to login" });
  }
};

export const getUserInfo = async (req, res, next) => {
  try {
    // Fetching the user data based on the userId attached to the request (from middleware like verifyToken)
    const userData = await User.findById(req.userId);

    // If no user data is found, return a 404 Not Found response
    if (!userData) {
      return res.status(404).json({ message: "User not found" });
    }

    // Return the user info if the user is found
    return res.status(200).json({
      User: {
        id: userData.id,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        image: userData.image,
        color: userData.color,
        profileSetup: userData.profileSetup,
      },
    });
  } catch (error) {
    // In case of an error during fetching, log it and send a 500 Internal Server Error response
    console.error("Error during getUserInfo:", error);
    res.status(500).json({ message: "Failed to get user info" });
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { userId } = req;
    const { firstName, lastName, color } = req.body;
    if (!firstName || !lastName) {
      return res
        .status(400)
        .json({ message: "First Name and Last Name are required" });
    }

    const userData = await User.findByIdAndUpdate(
      userId,
      { firstName, lastName, color, profileSetup: true },
      { new: true, runValidators: true }
    );

    if (!userData) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      User: {
        id: userData.id,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        image: userData.image,
        color: userData.color,
        profileSetup: userData.profileSetup,
      },
    });
  } catch (error) {
    console.error("Error during updateProfile:", error);
    res.status(500).json({ message: "Failed to update profile" });
  }
};

export const addProfileImage = async (req, res, next) => {
  try {
    // Check if the file is provided
    if (!req.file) {
      return res.status(400).json({ message: "Image is required" });
    }
    // Check if userId is available on the request object
    if (!req.userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const date = Date.now();
    const uploadDir = "upload/profiles";
    if (!existsSync(uploadDir)) {
      mkdirSync(uploadDir, { recursive: true });
    }

    const fileName = `${uploadDir}/${date}-${req.file.originalname}`;
    renameSync(req.file.path, fileName);

    const userId = req.userId;
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { image: fileName },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      User: {
        id: updatedUser.id,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        image: updatedUser.image,
        color: updatedUser.color,
        profileSetup: updatedUser.profileSetup,
      },
    });
  } catch (error) {
    console.error("Error during addProfileImage:", error);
    res.status(500).json({ message: "Failed to add profile image" });
  }
};

export const deleteProfileImage = async (req, res, next) => {
  try {
    const { userId } = req; // Ensure userId is set correctly
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if user has a profile image
    if (!user.image) {
      return res.status(400).json({ message: "No profile image to delete" });
    }

    // Construct the full path of the image to delete
    const imagePath = path.resolve(user.image);

    // Delete the profile image
    unlinkSync(imagePath);

    user.image = null; // Remove the image reference
    await user.save(); // Save the user document

    return res.status(200).json({
      message: "Profile image deleted successfully",
    });
  } catch (error) {
    console.error("Error during deleteProfileImage:", error);
    res.status(500).json({ message: "Failed to delete profile image" });
  }
};

export const logout = async (req, res, next) => {
  try {
    res.cookie("jwt", "", { maxAge: 1, sameSite: "None" });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Error during logout:", error);
    res.status(500).json({ message: "Failed to logout" });
  }
};
