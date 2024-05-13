import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import { UserService } from "../../services/UserService";
import { UserType } from "../../models/user.model";
import { TokenService } from "../../services/TokenService";

export class UserController {
    constructor(
        private readonly userService: UserService,
        private readonly tokenService: TokenService,
    ) {}

    findAll = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const users = await this.userService.findAll();
            res.status(200).json(users);
        } catch (error) {
            next(error);
        }
    };

    deleteById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            await this.userService.deleteById(req.params.userId);

            // delete all refreshTokens of user
            await this.tokenService.deleteAllRefreshTokensOfUser(
                req.params.userId,
            );

            res.status(204).json();
        } catch (err) {
            next(err);
        }
    };

    findById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = await this.userService.findById(req.params.userId);

            if (!user) {
                const error = createHttpError(
                    404,
                    `User with ${req.params.userId} does not exist`,
                );
                return next(error);
            }

            res.status(200).json(user);
        } catch (error) {
            next(error);
        }
    };

    updateById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            //if user not found throw an error or update the user

            const userOrError = await this.userService.findById(
                req.params.userId,
            );

            if (!userOrError) {
                const error = createHttpError(404, "User not found");
                return next(error);
            }

            const { name } = req.body as Partial<UserType>;

            //if they are equal, update the user and return the updated user
            const updatedUser = await this.userService.findByIdAndUpdate(
                req.params.userId,
                { name },
            );

            res.status(200).json(updatedUser);
        } catch (e) {
            next(e);
        }
    };
}
