import { NextFunction, Request, Response } from "express";
import { AuthRequest } from "../controllers/AuthController";
import createHttpError from "http-errors";
import { PostRequest } from "./types";

export const isPoster = (req: Request, _res: Response, next: NextFunction) => {
  try {
    const _req = req as AuthRequest & PostRequest;

    if (_req.post.postedBy !== _req.auth.userId) {
      throw createHttpError(403, "user is unauthorized");
    }
    next();
  } catch (e) {
    next(e);
  }
};
