import express, { NextFunction, Request, Response } from "express";
import logger from "./config/logger";
import { HttpError } from "http-errors";
const app = express();
import authRouter from "./routes/auth-routes";
import userRouter from "./routes/user-routes";
import selfRouter from "./routes/self-routes";
import cookieParse from "cookie-parser";

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
// Save the original append method
// eslint-disable-next-line @typescript-eslint/unbound-method

const cookieParser = cookieParse();

app.use(express.json());

app.use(cookieParser);

app.use("/auth", authRouter);

app.use("/users", userRouter);

app.use("/self", selfRouter);

app.use(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (error: HttpError, _req: Request, res: Response, _next: NextFunction) => {
        logger.error(error.message);
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

export default app;
