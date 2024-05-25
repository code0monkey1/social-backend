import { NextFunction, Request, Response } from "express";
import { AuthRequest } from "../controllers/AuthController";
import createHttpError from "http-errors";
import Post from "../models/post.model";

export const hasPostMutationAuth = async (
    req: Request,
    _res: Response,
    next: NextFunction,
) => {
    try {
        const _req = req as AuthRequest;

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
