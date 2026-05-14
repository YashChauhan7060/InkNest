import { Request, Response } from "express";
import User from "../model/User.js";
import jwt from "jsonwebtoken";
import TryCatch from "../utils/TryCatch.js";
import { AuthenticatedRequest } from "../middleware/isAuth.js";
import getBuffer from "../utils/dataUri.js";
import { v2 as cloudinary } from "cloudinary";
import { oauth2client } from "../utils/GoogleConfig.js";
import axios from "axios";
import { GoogleGenAI } from "@google/genai";



export const loginUser = TryCatch(async (req, res) => {
  const { code } = req.body;
  console.log("code received:", code);

  if (!code) {
    res.status(400).json({
      message: "Authorization code is required",
    });
    return;
  }

  let googleRes;

  try{
      googleRes = await oauth2client.getToken(code);
      console.log("googleRes tokens:", googleRes.tokens);
      oauth2client.setCredentials(googleRes.tokens);
  }
  catch(googleError){
      console.log("Google getToken failed:", googleError);
      res.status(500).json({ message: "Google auth failed", error: googleError });
      return;
  }

  console.log("step 1 - fetching userinfo");
  const userRes = await axios.get(`https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${googleRes.tokens.access_token}`);

  console.log("step 2 - userRes:", userRes.data);
  const { email, name, picture } = userRes.data as any;

  console.log("step 3 - finding user in DB");
  let user = await User.findOne({ email });

  console.log("step 4 - user found:", user);
  if (!user) {
    user = await User.create({
      name,
      email,
      image: picture,
    });
    console.log("step 5 - user created:", user);
  }

  console.log("step 6 - signing JWT");
  const token = jwt.sign({ user }, process.env.JWT_SEC as string, {
    expiresIn: "5d",
  });

  console.log("step 7 - sending response");
  res.status(200).json({
    message: "Login success",
    token,
    user,
  });
});

export const myProfile = TryCatch(async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user;

  res.status(200).json(user);
});

export const getUserProfile = TryCatch(async (req: Request, res: Response) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404).json({
      message: "No user with this id",
    });
    return;
  }

  res.json(user);
});

export const updateUser = TryCatch(async (req: AuthenticatedRequest, res: Response) => {
  const { name, instagram, facebook, linkedin, bio } = req.body;

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      name,
      instagram,
      facebook,
      linkedin,
      bio,
    },
    { new: true }
  );

  const token = jwt.sign({ user }, process.env.JWT_SEC as string, {
    expiresIn: "5d",
  });

  res.json({
    message:"user updated",
    token,
    user
  });
});

export const updateProfilePic = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const file = req.file;

    if (!file) {
      res.status(400).json({
        message: "No file to upload",
      });
      return;
    }

    const fileBuffer = getBuffer(file);

    if (!fileBuffer || !fileBuffer.content) {
      res.status(400).json({
        message: "Failed to generate buffer",
      });
      return;
    }
    const cloud = await cloudinary.uploader.upload(fileBuffer.content, {
      folder: "blogs",
    });

    const user = await User.findByIdAndUpdate(
      req.user?._id,
      {
        image: cloud.secure_url,
      },
      { new: true }
    );

    const token = jwt.sign({ user }, process.env.JWT_SEC as string, {
      expiresIn: "5d",
    });

    res.json({
      message: "User Profile pic updated",
      token,
      user,
    });
  }
);