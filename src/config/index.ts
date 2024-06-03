import { config } from "dotenv";
config();

const {
    PORT,
    NODE_ENV,
    MONGODB_URI,
    JWT_SECRET,
    JWT_EXPIRATION_TIME,
    MONGODB_URI_TEST,
} = process.env;

export const Config = {
    PORT,
    NODE_ENV,
    MONGODB_URI,
    MONGODB_URI_TEST,
    JWT_SECRET,
    JWT_EXPIRATION_TIME,
};
