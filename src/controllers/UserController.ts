import { NextFunction, Request, Response } from "express";
import { UserService } from "../services/UserService";
import { PhotoType, UserType } from "../models/user.model";
import { TokenService } from "../services/TokenService";
import fs from "fs";
import { AuthRequest } from "./AuthController";
import logger from "../config/logger";
import createHttpError from "http-errors";
import getDefaultProfileImageAndType from "../helpers";

export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly tokenService: TokenService,
  ) {}

  addFollowing = async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const _req = req as AuthRequest;

      const { userId } = _req.auth;

      const { userId: followId } = req.params;

      await this.userService.addFollowing(userId, followId);

      next();
    } catch (e) {
      next(e);
    }
  };

  addFollower = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const _req = req as AuthRequest;

      const { userId } = _req.auth;

      const { userId: followId } = req.params;

      await this.userService.addFollower(userId, followId);

      res.json();
    } catch (e) {
      next(e);
    }
  };

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
      await this.tokenService.deleteAllRefreshTokensOfUser(req.params.userId);

      res.status(204).json();
    } catch (err) {
      next(err);
    }
  };

  findById = async (
    req: Request,
    _res: Response,
    next: NextFunction,
    id: string,
  ) => {
    try {
      const user = await this.userService.findById(id);

      const _req = req as UserRequest;

      if (!user) {
        throw createHttpError(404, `User with ${id} does not exist`);
      }

      _req.user = user.toJSON();

      next();
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
        fs.unlink(req.file.path, (err) => {
          if (err) {
            logger.error(err);
            const error = createHttpError(400, `Invalid file type`);
            return next(error);
          }
        });
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

  removeFollowing = async (
    req: Request,
    _res: Response,
    next: NextFunction,
  ) => {
    try {
      const _req = req as AuthRequest;

      const { userId } = _req.auth;

      const followingId = req.params.userId;

      await this.userService.removeFollowing(userId, followingId);

      next();
    } catch (e) {
      next(e);
    }
  };
  removeFollower = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const _req = req as AuthRequest;

      const { userId } = _req.auth;

      const followingId = req.params.userId;

      await this.userService.removeFollower(userId, followingId);

      res.json();
    } catch (e) {
      next(e);
    }
  };

  avatar = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const _req = req as UserRequest;

      const avatar = await this.userService.getUserAvatar(_req.user.id);

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

  recommendations = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const _req = req as UserRequest;

      const usersToFollow = await this.userService.getRecommendations(
        _req.user,
      );

      res.json(usersToFollow);
    } catch (e) {
      next(e);
    }
  };
}

export interface UserRequest extends Request {
  user: PopulatedUser;
}

export interface PopulatedUser {
  id: string;
  name: string;
  email: string;
  about?: string;
  avatar?: PhotoType;
  followers?: { id: string; name: string }[];
  following?: { id: string; name: string }[];
}
