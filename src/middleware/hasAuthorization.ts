import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import { isValidObjectId } from "mongoose";
import { AuthRequest } from "../controllers/auth/AuthController";

export const hasAuthorization = (
    req: Request,
    _res: Response,
    next: NextFunction,
) => {
    try {
        const authRequest = req as AuthRequest;

        if (!isValidObjectId(req.params.userId)) {
            throw createHttpError(400, "userId is of invalid type");
        }

        if (req.params.userId !== authRequest.auth.userId) {
            throw createHttpError(401, "Unauthorized");
        }

        next();
    } catch (e) {
        next(e);
    }
};
