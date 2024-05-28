import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import { CommentType, PostType } from "../models/post.model";
import { AuthRequest, UncommentType } from "./AuthController";
import { PostService } from "../services/PostService";
import fs from "fs";
import logger from "../config/logger";
import createHttpError from "http-errors";
import { PostRequest } from "../middleware/types";
import { UserRequest } from "./UserController";

export class PostController {
    constructor(private readonly postService: PostService) {}

    getFeed = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const _req = req as UserRequest;
            const following = [] as string[];

            _req.user?.following?.forEach((f) => {
                following.push(f.id);
            });

            const posts = await this.postService.getFeed(following);
            res.json(posts);
        } catch (e) {
            next(e);
        }
    };

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
            const _req = req as PostRequest;

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
                _req.post._id.toString(),
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
            const result = validationResult(req);

            const _req = req as PostRequest;

            if (!result.isEmpty()) {
                return res.status(400).json({ errors: result.array() });
            }

            const savedPost = await this.postService.comment(
                _req.post._id.toString(),
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

            const _req = req as PostRequest & AuthRequest;

            const updatedPost = await this.postService.uncomment(
                _req.post,
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
            const _req = req as AuthRequest & PostRequest;

            const updatedPost = await this.postService.like(
                _req.post,
                _req.auth.userId,
            );

            res.status(201).json(updatedPost);
        } catch (e) {
            next(e);
        }
    };

    unlike = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const _req = req as AuthRequest & PostRequest;

            const updatedPost = await this.postService.unlike(
                _req.post,
                _req.auth.userId,
            );

            res.json(updatedPost);
        } catch (e) {
            next(e);
        }
    };

    photo = (req: Request, res: Response, next: NextFunction) => {
        try {
            const _req = req as PostRequest;

            // set content type and data of image to response
            res.set("Content-Type", _req.post?.photo?.contentType);

            res.send(_req.post?.photo?.data);
        } catch (e) {
            next(e);
        }
    };

    getUserPosts = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const _req = req as UserRequest;

            const posts = await this.postService.findByUserId(_req.user.id);

            res.json(posts);
        } catch (e) {
            next(e);
        }
    };

    getPostById = async (
        req: Request,
        _res: Response,
        next: NextFunction,
        id: string,
    ) => {
        try {
            const post = await this.postService.findById(id);

            if (!post) {
                throw createHttpError(404, "The post does not exist");
            }

            const _req = req as PostRequest;
            _req.post = post;

            next();
        } catch (e) {
            next(e);
        }
    };
}
