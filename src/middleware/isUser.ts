import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";

import { AuthRequest } from "../controllers/AuthController";

export const isUser = (req: Request, _res: Response, next: NextFunction) => {
  try {
    const authRequest = req as AuthRequest;

    if (authRequest.auth.userId !== req.params.userId) {
      throw createHttpError(403, "user is unauthorized");
    }

    next();
  } catch (e) {
    next(e);
  }
};
