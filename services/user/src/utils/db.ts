import mongoose from "mongoose";

const connectDb = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log("Connected to mongodb");
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

export default connectDb;