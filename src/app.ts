import express, { NextFunction, Request, Response } from "express";
import logger from "./config/logger";
import multer from "multer";
import { HttpError } from "http-errors";
import authRouter from "./routes/auth-routes";
import userRouter from "./routes/user-routes";
import selfRouter from "./routes/self-routes";
import postRouter from "./routes/post-routes";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import cors from "cors";
import { Config } from "./config";
const app = express();

app.use(express.json());

app.use(cookieParser());

app.use(
    cors({
        origin: [Config.CLIENT_URL!],
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true,
    }),
);

app.use("/auth", authRouter);

app.use("/users", userRouter);

app.use("/self", selfRouter);

app.use("/posts", postRouter);

logger.info(`The client url is ${Config.CLIENT_URL}✅`);

app.use(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (error: HttpError, _req: Request, res: Response, _next: NextFunction) => {
        logger.error(error);

        if (error instanceof mongoose.Error.CastError) {
            error.statusCode = 400;
            error.message = "Invalid id Mongoose id";
        }
        if (error instanceof multer.MulterError)
            error.statusCode = multerErrorStatusCodes[error.code];

        const statusCode = error.statusCode || error.status || 500;

        res.status(statusCode).json({
            errors: [
                {
                    type: error.name,
                    message: error.message,
                    stack: "",
                    path: "",
                    location: "",
                },
            ],
        });
    },
);

const multerErrorStatusCodes = {
    LIMIT_PART_COUNT: 400,
    LIMIT_FILE_SIZE: 413,
    LIMIT_FILE_COUNT: 400,
    LIMIT_FIELD_KEY: 400,
    LIMIT_FIELD_VALUE: 400,
    LIMIT_FIELD_COUNT: 400,
    LIMIT_UNEXPECTED_FILE: 400,
};

export default app;
