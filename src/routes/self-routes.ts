/* eslint-disable @typescript-eslint/no-misused-promises */
import { NextFunction, Router, Request, Response } from "express";
import User, { PhotoType } from "../models/user.model";
import authenticate from "../middleware/authenticate";
import { AuthRequest } from "../controllers/auth/AuthController";
import createHttpError from "http-errors";

const route = Router();

route.get(
    "/avatar",
    authenticate,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const {
                auth: { userId },
            } = req as AuthRequest;

            const user = await User.findById(userId);

            if (!user) {
                const error = createHttpError(
                    404,
                    `User with ${userId} does not exist`,
                );
                return next(error);
            }

            const { avatar } = (await User.findById(userId)) as {
                avatar: PhotoType;
            };

            res.json(avatar.data);
        } catch (e) {
            next(e);
        }
    },
);

export default route;
