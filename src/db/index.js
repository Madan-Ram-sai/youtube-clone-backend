import mongoose from "mongoose";
import {DB_NAME} from "../constants.js";

const connectDB = async() =>{
    try{
        if (!process.env.MONGODB_URI) {
            throw new Error("MONGODB_URI not found");
            exit(1);
        }
        if (!process.env.DB_NAME) {
            throw new Error("DB_NAME not found");
            exit(1);
        }

        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        // console.log(`\n MongoDB connected!! DB HOST:${connectionInstance}`)
        console.log(`\n MongoDB connected!! DB HOST:${connectionInstance.connection.host}`)
    } catch(error){
        console.log("MONGODB connection FAILED ",error);
        process.exit(1);
    }
}

export default connectDB;