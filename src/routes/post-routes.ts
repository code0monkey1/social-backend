/* eslint-disable @typescript-eslint/no-misused-promises */
import { Router, Request, NextFunction, Response } from "express";
import Post, { PostType } from "../models/post.model";
import { AuthRequest } from "../controllers/AuthController";

const route = Router();

// user post routes

route.post(
    "/:userId/posts",
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const _req = req as AuthRequest;

            const body = req.body as PostType;

            const postBody: Partial<PostType> = {
                postedBy: _req.auth.userId,
                text: body.text,
            };

            const post = await Post.create(postBody);

            res.status(201).json(post);
        } catch (e) {
            next(e);
        }
    },
);

export default route;
