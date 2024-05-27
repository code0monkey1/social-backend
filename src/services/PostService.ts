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
        return await this.postRepository.findById(postId);
    };

    comment = async (postId: string, comment: CommentType) => {
        //add createdAt
        comment.createdAt = new Date(Date.now());

        return await this.postRepository.comment(postId, comment);
    };
    uncomment = async (post: PostType, commentId: string, userId: string) => {
        const comment = post.comments.find(
            (comment) => comment._id.toString() === commentId,
        );

        if (!comment) {
            throw createHttpError(404, "The comment does not exist");
        }

        if (comment.postedBy.toString() !== userId) {
            throw createHttpError(403, "user is unauthorized");
        }

        return await this.postRepository.uncomment(
            post._id.toString(),
            commentId,
        );
    };

    like = async (post: PostType, userId: string) => {
        if (post.postedBy.toString() === userId) {
            throw createHttpError(403, "user is unauthorized");
        }

        return await this.postRepository.like(post._id.toString(), userId);
    };

    unlike = async (post: PostType, userId: string) => {
        if (post.postedBy.toString() === userId) {
            throw createHttpError(403, "user is unauthorized");
        }

        return await this.postRepository.unlike(post._id.toString(), userId);
    };

    photo = (post: PostType) => {
        if (post.photo?.data) {
            post.photo;
        }
        return post;
    };
}
