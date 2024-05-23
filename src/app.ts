import express, { NextFunction, Request, Response } from "express";
import logger from "./config/logger";
import multer from "multer";
import { HttpError } from "http-errors";
import authRouter from "./routes/auth-routes";
import userRouter from "./routes/user-routes";
import selfRouter from "./routes/self-routes";
import postRouter from "./routes/post-routes";
import cookieParse from "cookie-parser";

const app = express();

const cookieParser = cookieParse();

app.use(express.json());

app.use(cookieParser);

app.use("/auth", authRouter);

app.use("/users", userRouter);

app.use("/self", selfRouter);

app.use("/posts", postRouter);

app.use(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (error: HttpError, _req: Request, res: Response, _next: NextFunction) => {
        logger.error(error);
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
