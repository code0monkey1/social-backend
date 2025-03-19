// a middleware to attach user to the request object from the cookie token info form the frotend
import { NextFunction, Request, Response } from "express";
import { AuthRequest } from "../controllers/AuthController";
import { UserService } from "../services/UserService";
import createHttpError from "http-errors";
import { UserRequest } from "../controllers/UserController";

export const fetchUser = (userService: UserService) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = (req as AuthRequest).auth;

      const user = await userService.findById(userId);

      if (!user) {
        throw createHttpError(404, "User not found");
      }

      (req as UserRequest).user = user.toJSON();
      next();
    } catch (error) {
      next(error);
    }
  };
};
