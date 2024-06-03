// create a mongoose instance
import mongoose from "mongoose";
import { Config } from "../config";
import logger from "../config/logger";
import { MongoMemoryServer } from "mongodb-memory-server";
let mockDbUrl: string;
let mockDb: MongoMemoryServer;

export const db = {
    connect: async () => {
        try {
            if (Config.NODE_ENV === "test") {
                mockDb = await MongoMemoryServer.create();
                mockDbUrl = mockDb.getUri();
            }

            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            await mongoose.connect(
                Config.NODE_ENV === "test" ? mockDbUrl : Config.MONGODB_URI!,
            );

            logger.info("✅ MongoDb connected!", Config.MONGODB_URI!);
        } catch (error) {
            logger.error("❌ Error connecting to MongoDB", error);
        }
    },

    disconnect: async () => {
        try {
            await mongoose.connection.dropDatabase();
            await mongoose.disconnect();
            await mongoose.connection.close();

            if (mockDb) await mockDb.stop();
        } catch (error) {
            if (error instanceof Error)
                logger.error(`error connecting from MongoDB: ${error.message}`);
        }
    },

    clear: async () => {
        try {
            await mongoose.connection.dropDatabase();
        } catch (error) {
            if (error instanceof Error)
                logger.error(`error connecting from MongoDB: ${error.message}`);
        }
    },
};
