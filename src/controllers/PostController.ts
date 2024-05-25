import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import { CommentType, PostType } from "../models/post.model";
import { AuthRequest, UncommentType } from "./AuthController";
import { PostService } from "../services/PostService";
import fs from "fs";
import logger from "../config/logger";
import createHttpError from "http-errors";
import { isValidObjectId } from "mongoose";

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
    updatePost = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const updateBody = req.body as Partial<PostType>;

            const result = validationResult(req);

            if (!result.isEmpty()) {
                return res.status(400).json({ errors: result.array() });
            }

            if (req.file) {
                updateBody.photo = {
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

            const updatedPost = await this.postService.updatePost(
                req.params.postId,
                updateBody,
            );

            res.json(updatedPost);
        } catch (e) {
            next(e);
        }
    };

    deletePost = async (req: Request, res: Response, next: NextFunction) => {
        try {
            await this.postService.findByIdAndDelete(req.params.postId);

            res.json();
        } catch (e) {
            next(e);
        }
    };

    comment = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const _req = req as AuthRequest;

            if (!isValidObjectId(_req.auth.userId)) {
                throw createHttpError(400, "userId is of invalid type");
            }

            const { postId } = req.params;

            const savedPost = await this.postService.comment(
                postId,
                req.body as CommentType,
            );

            res.status(201).json(savedPost);
        } catch (e) {
            next(e);
        }
    };

    uncomment = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { commentId } = req.body as UncommentType;

            const _req = req as AuthRequest;

            if (!isValidObjectId(_req.auth.userId)) {
                throw createHttpError(400, "userId is of invalid type");
            }

            const updatedPost = await this.postService.uncomment(
                req.params.postId,
                commentId,
                _req.auth.userId,
            );

            res.json(updatedPost);
        } catch (e) {
            next(e);
        }
    };

    like = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const _req = req as AuthRequest;

            if (!isValidObjectId(_req.auth.userId)) {
                throw createHttpError(400, "userId is of invalid type");
            }

            const { postId } = req.params;

            const updatedPost = await this.postService.like(
                postId,
                _req.auth.userId,
            );

            res.json(updatedPost);
        } catch (e) {
            next(e);
        }
    };
}
