import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import { PostType } from "../models/post.model";
import { AuthRequest } from "./AuthController";
import { PostService } from "../services/PostService";
import fs from "fs";
import logger from "../config/logger";
import createHttpError from "http-errors";
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

            const postBody: Partial<PostType> = {
                postedBy: _req.auth.userId,
                text: body.text,
            };

            // if the request has file , then attach image to postBody

            if (req.file) {
                postBody.photo = {
                    data: fs.readFileSync(req.file.path),
                    contentType: req.file.mimetype,
                };

                //delete file
                fs.unlink(req.file.path, (err) => {
                    if (err) {
                        logger.error(err);
                        const error = createHttpError(400, `Invalid file type`);
                        return next(error);
                    }
                });
            }

            const post = await this.postService.createPost(postBody);

            res.status(201).json(post);
        } catch (e) {
            next(e);
        }
    };
}
