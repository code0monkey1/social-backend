import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import { UserService } from "../services/UserService";
import getDefaultProfileImageAndType from "../helpers";
import { AuthRequest } from "./AuthController";

export class SelfController {
    constructor(private readonly userService: UserService) {}

    self = async (req: Request, res: Response, next: NextFunction) => {
        try {
            // get userId from cookie
            const { userId } = (req as AuthRequest).auth;

            const user = await this.userService.findUserById(userId);

            if (!user) {
                throw createHttpError(404, "User not found");
            }

            res.json(user);
        } catch (error) {
            next(error);
        }
    };
    avatar = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const {
                auth: { userId },
            } = req as AuthRequest;

            const { _id } = await this.userService.findUserById(userId);

            const avatar = await this.userService.getUserAvatar(_id.toString());

            if (!avatar?.data) {
                return next();
            }
            res.set("Content-Type", avatar.contentType);
            res.json(avatar.data);
        } catch (e) {
            next(e);
        }
    };
    defaultAvatar = (req: Request, res: Response, next: NextFunction) => {
        try {
            const { defaultImageBuffer, defaultImageType } =
                getDefaultProfileImageAndType();

            res.set("Content-Type", defaultImageType);

            res.send(defaultImageBuffer);
        } catch (e) {
            next(e);
        }
    };
}

export interface RegisterRequest extends Request {
    body: UserData;
}

export interface LoginRequest extends Request {
    body: {
        email: string;
        password: string;
    };
}

export interface UserData {
    name: string;
    email: string;
    password: string;
}
