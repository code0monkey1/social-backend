import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import { PostType } from "../models/post.model";
import { AuthRequest } from "./AuthController";
import { PostService } from "../services/PostService";

export class PostController {
    constructor(private readonly postService: PostService) {}

    createPost = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const _req = req as AuthRequest;

            const body = req.body as PostType;

            const result = validationResult(req);

            if (!result.isEmpty()) {
                return res.status(400).json({ errors: result.array() });
            }

            const postBody = {
                postedBy: _req.auth.userId,
                text: body.text,
            };

            const post = await this.postService.createPost(postBody);

            res.status(201).json(post);
        } catch (e) {
            next(e);
        }
    };
}
