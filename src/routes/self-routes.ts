/* eslint-disable @typescript-eslint/no-misused-promises */
import { NextFunction, Router, Request, Response } from "express";
import authenticate from "../middleware/authenticate";
import { AuthRequest } from "../controllers/auth/AuthController";
import { makeUserService } from "../factories/services/user-service-factory";
import getDefaultProfileImageAndType from "../helpers";

const route = Router();

route.get(
    "/avatar",
    authenticate,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const {
                auth: { userId },
            } = req as AuthRequest;

            const userService = makeUserService();

            const { _id } = await userService.findUserById(userId);

            const avatar = await userService.getUserAvatar(_id.toString());

            if (!avatar?.data) {
                return next();
            }
            res.set("Content-Type", avatar.contentType);
            res.json(avatar.data);
        } catch (e) {
            next(e);
        }
    },

    (req: Request, res: Response, next: NextFunction) => {
        try {
            const { defaultImageBuffer, defaultImageType } =
                getDefaultProfileImageAndType();

            res.set("Content-Type", defaultImageType);

            res.send(defaultImageBuffer);
        } catch (e) {
            next(e);
        }
    },
);

export default route;
