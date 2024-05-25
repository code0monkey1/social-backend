import createHttpError from "http-errors";
import { CommentType, PostType } from "../models/post.model";
import { PostRepository } from "../repositories/PostRepository";

export class PostService {
    constructor(private readonly postRepository: PostRepository) {}

    createPost = async (postBody: Partial<PostType>) => {
        return await this.postRepository.cratePost(postBody);
    };

    updatePost = async (postId: string, postBody: Partial<PostType>) => {
        return await this.postRepository.updatePost(postId, postBody);
    };

    findByIdAndDelete = async (postId: string) => {
        return await this.postRepository.findByIdAndDelete(postId);
    };

    findById = async (postId: string) => {
        const post = await this.postRepository.findById(postId);

        if (!post) {
            throw createHttpError(404, "The post does not exist");
        }
    };

    comment = async (postId: string, comment: CommentType) => {
        const post = await this.postRepository.findById(postId);

        if (!post) {
            throw createHttpError(404, "The post does not exist");
        }

        //add createdAt
        comment.createdAt = new Date(Date.now());

        return await this.postRepository.comment(postId, comment);
    };
    uncomment = async (postId: string, commentId: string, userId: string) => {
        const post = await this.postRepository.findById(postId);

        if (!post) {
            throw createHttpError(404, "The post does not exist");
        }

        const comment = post.comments.find(
            (comment) => comment._id.toString() === commentId,
        );

        if (!comment) {
            throw createHttpError(404, "The comment does not exist");
        }

        if (comment.postedBy.toString() !== userId) {
            throw createHttpError(403, "user is unauthorized");
        }

        return await this.postRepository.uncomment(postId, commentId);
    };

    like = async (postId: string, userId: string) => {
        const post = await this.postRepository.findById(postId);

        if (!post) {
            throw createHttpError(404, "The post does not exist");
        }

        if (post.postedBy.toString() === userId) {
            throw createHttpError(403, "user is unauthorized");
        }

        return await this.postRepository.like(postId, userId);
    };

    unlike = async (postId: string, userId: string) => {
        const post = await this.postRepository.findById(postId);

        if (!post) {
            throw createHttpError(404, "The post does not exist");
        }

        if (post.postedBy.toString() === userId) {
            throw createHttpError(403, "user is unauthorized");
        }

        return await this.postRepository.unlike(postId, userId);
    };

    photo = async (postId: string) => {
        const post = await this.postRepository.findById(postId);

        if (!post) {
            throw createHttpError(404, "The post does not exist");
        }

        return post.photo;
    };
}
