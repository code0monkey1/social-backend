import { NextFunction, Request, Response } from "express";
import { AuthRequest } from "../controllers/AuthController";
import createHttpError from "http-errors";
import Post from "../models/post.model";
import { isValidObjectId } from "mongoose";

export const hasPostMutationAuth = async (
    req: Request,
    _res: Response,
    next: NextFunction,
) => {
    try {
        const _req = req as AuthRequest;

        if (!isValidObjectId(_req.auth.userId)) {
            throw createHttpError(400, "userId is of invalid type");
        }

        if (!isValidObjectId(req.params.postId)) {
            throw createHttpError(400, "postId is of invalid type");
        }

        const post = await Post.findById(req.params.postId);

        if (!post) {
            throw createHttpError(404, "The post does not exist");
        }

        if (post.postedBy !== _req.auth.userId) {
            throw createHttpError(403, "user is unauthorized");
        }
        next();
    } catch (e) {
        next(e);
    }
};
