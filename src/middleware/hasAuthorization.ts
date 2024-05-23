import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import { isValidObjectId } from "mongoose";
import { AuthRequest } from "../controllers/AuthController";

export const hasAuthorization = (
    req: Request,
    _res: Response,
    next: NextFunction,
) => {
    try {
        const authRequest = req as AuthRequest;

        if (!isValidObjectId(authRequest.auth.userId)) {
            throw createHttpError(400, "userId is of invalid type");
        }

        if (authRequest.auth.userId !== req.params.userId) {
            throw createHttpError(403, "user is unauthorized");
        }

        next();
    } catch (e) {
        next(e);
    }
};
