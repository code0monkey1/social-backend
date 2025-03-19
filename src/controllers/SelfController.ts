import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import { UserService } from "../services/UserService";
import getDefaultProfileImageAndType from "../helpers";
import { AuthRequest } from "./AuthController";
import { Logger } from "winston";
import { UserRequest } from "./UserController";

interface UserAvatar {
  data: Buffer;
  contentType: string;
}

export class SelfController {
  constructor(
    private readonly userService: UserService,
    private readonly logger: Logger,
  ) {}

  self = (req: Request, res: Response, next: NextFunction) => {
    try {
      // get userId from cookie
      const user = (req as UserRequest).user;

      this.logger.info(`User with id ${user.id} is trying to get his data`);

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

      const user = await this.userService.findById(userId);

      if (!user) {
        throw createHttpError(404, "User not found");
      }

      const { _id } = (await this.userService.findById(userId)) as {
        _id: string;
      };

      const avatar = (await this.userService.getUserAvatar(
        _id.toString(),
      )) as UserAvatar;

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
