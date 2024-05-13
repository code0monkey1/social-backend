// create a mongoose instance
import mongoose from "mongoose";
import { Config } from "../config";
import logger from "../config/logger";

export const db = {
    connect: async () => {
        try {
            await mongoose.connect(Config.MONGODB_URI!);

            logger.info("✅ MongoDb connected!");
        } catch (error) {
            logger.error("❌ Error connecting to MongoDB", error);
        }
    },

    disconnect: async () => {
        await mongoose.disconnect();
    },
};
