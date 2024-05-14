/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import { UserService } from "../../services/UserService";
import { UserType } from "../../models/user.model";
import { TokenService } from "../../services/TokenService";
import fs from "fs";
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

    // [x] TODO:“Modify the user update controller in the backend to process the uploaded photo”
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

            const { name, about } = req.body as Partial<UserType>;
            const updateData: Partial<UserType> = {};

            // Add fields to updateData only if they are provided in the request body
            if (name) updateData.name = name;
            if (about) updateData.about = about;

            if (req.file) {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
                updateData.avatar = {
                    data: fs.readFileSync(req.file.path),
                    contentType: req.file.mimetype,
                };

                //delete file
                fs.unlinkSync(req.file.path);
            }

            // Update the user with the provided fields
            const updatedUser = await this.userService.findByIdAndUpdate(
                req.params.userId,
                updateData,
            );

            // Return the updated user data
            res.status(200).json(updatedUser);
        } catch (e) {
            next(e);
        }
    };
}
