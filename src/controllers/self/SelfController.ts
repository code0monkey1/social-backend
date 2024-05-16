import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import { TokenService } from "../../services/TokenService";
import { UserService } from "../../services/UserService";

export class AuthController {
    constructor(
        private readonly tokenService: TokenService,
        private readonly userService: UserService,
    ) {}

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
}

export interface AuthRequest extends Request {
    auth: {
        userId: string;
        refreshTokenId: string;
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
