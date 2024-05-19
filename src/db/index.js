import mongoose from "mongoose";
import { DB_NAME } from '../constants.js';

const connectDB = async () => {
    try {
        const connectionInstancs = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        // const connectionInstancs = await mongoose.connect('mongodb://127.0.0.1:27017/test');

        console.log(`\n MongoDB Connected!! DB HOST: ${connectionInstancs.connection.host}`);
    } catch (error) {
        console.log("MongoDB connection Error :: ", error);
        process.exit(1)
    }
}

export default connectDB