import { NextFunction, Request, Response } from "express";
import User, { UserRoles } from "../models/user.model";
import createHttpError from "http-errors";
import { TokenService } from "../services/TokenService";
import { UserService } from "../services/UserService";
import { validationResult } from "express-validator";
import { Logger } from "winston";

export class AuthController {
    constructor(
        private readonly tokenService: TokenService,
        private readonly userService: UserService,
        private readonly logger: Logger,
    ) {}

    self = async (req: Request, res: Response, next: NextFunction) => {
        try {
            // get userId from cookie
            const { userId } = (req as AuthRequest).auth;

            const user = await this.userService.findById(userId);

            if (!user) {
                throw createHttpError(404, "User not found");
            }

            res.json(user);
        } catch (error) {
            next(error);
        }
    };

    register = async (req: Request, res: Response, next: NextFunction) => {
        try {
            let { name, email, password } = req.body as UserData;

            const { role } = req.body as UserData;

            if (role === UserRoles.GUEST) {
                const { guest_name, guest_email, guest_password } =
                    this.userService.getGuestDetails();

                name = guest_name;
                email = guest_email;
                password = guest_password;
            } else {
                const result = validationResult(req);

                if (!result.isEmpty()) {
                    return res.status(400).json({ errors: result.array() });
                }

                const user = await User.findOne({ email });

                if (user) {
                    const error = createHttpError(400, "User already exists");
                    throw error;
                }
            }

            // create a new user
            const newUser = await this.userService.createUser(
                name,
                email,
                password,
                role || UserRoles.USER,
            );

            // set access cookie
            this.tokenService.setAccessToken(res, {
                userId: newUser._id.toString(),
            });

            // set refresh cookie , guest refreshToken will expire after 1 day
            await this.tokenService.setRefreshToken(
                res,
                { userId: newUser._id.toString() },
                newUser._id.toString(),
                role === UserRoles.GUEST,
            );

            res.status(201).json(newUser.id);
        } catch (e) {
            next(e);
        }
    };

    login = async (req: Request, res: Response, next: NextFunction) => {
        // set cookies

        try {
            const { email, password } = req.body as UserData;

            this.logger.info(
                `User ${email} with password ${password} is trying to login`,
            );

            const result = validationResult(req);

            if (!result.isEmpty()) {
                return res.status(400).json({ errors: result.array() });
            }

            const user = await this.userService.findByEmailAndPassword(
                email,
                password,
            );

            // set access cookie
            this.tokenService.setAccessToken(res, {
                userId: user?._id.toString(),
            });

            // set refresh cookie

            await this.tokenService.setRefreshToken(
                res,
                { userId: user?._id.toString() },
                user?._id.toString(),
            );

            res.status(200).json(user.id);
        } catch (e) {
            next(e);
        }
    };

    logout = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { refreshTokenId, userId } = (req as AuthRequest).auth;

            // remove refresh token from db

            await this.tokenService.deleteRefreshTokenOfUser(
                refreshTokenId,
                userId,
            );

            //remove refreshToken and accessToken from response cookies
            res.clearCookie("accessToken");
            res.clearCookie("refreshToken");

            res.end();
        } catch (e) {
            next(e);
        }
    };

    refresh = async (req: Request, res: Response, next: NextFunction) => {
        try {
            // delete previous refresh token
            const { refreshTokenId, userId } = (req as AuthRequest).auth;

            await this.tokenService.deleteRefreshTokenOfUser(
                refreshTokenId,
                userId,
            );

            // create new refreshToken
            const user = await this.userService.findById(userId);

            if (!user) {
                const error = createHttpError(404, "User not found");
                throw error;
            }

            const jwtPayload = {
                userId: user._id.toString(),
            };

            //create new accessToken

            this.tokenService.setAccessToken(res, jwtPayload);
            await this.tokenService.setRefreshToken(
                res,
                jwtPayload,
                user._id.toString(),
            );

            res.json();
        } catch (e) {
            next(e);
        }
    };
}

export interface UncommentType {
    commentId: string;
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
    role: UserRoles;
}
