import { NextFunction, Request, Response } from "express";
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
            // delete user by id
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

            res.status(200).json(user);
        } catch (error) {
            next(error);
        }
    };

    updateById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { name, about } = req.body as Partial<UserType>;
            const updateData: Partial<UserType> = {};

            if (name) updateData.name = name;
            if (about) updateData.about = about;

            if (req.file) {
                updateData.avatar = {
                    data: fs.readFileSync(req.file.path),
                    contentType: req.file.mimetype,
                };

                //delete file
                fs.unlinkSync(req.file.path);
            }

            const updatedUser = await this.userService.findByIdAndUpdate(
                req.params.userId,
                updateData,
            );

            res.status(200).json(updatedUser);
        } catch (e) {
            next(e);
        }
    };
}
