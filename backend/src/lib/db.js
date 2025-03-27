import mongoose from "mongoose";

export const connectDB = async() =>{
    try {
        const connectionInstance = await mongoose.connect(process.env.MONGODB_URI);
        console.log("MongoDB connected || host ", connectionInstance.connection.host);
    } catch (error) {
        console.log("Error while connecting mongoDb ",error);
    }
};

