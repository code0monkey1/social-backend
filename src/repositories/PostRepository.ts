import { postOptions } from "../config/pagination";
import Post, { CommentType, PostType } from "../models/post.model";

export class PostRepository {
    getFeed = async (following: string[]) => {
        // get the posts of the people the user is following
        return await Post.find({ postedBy: { $in: following } })
            .populate("postedBy", "_id name")
            .populate("comments.postedBy", "_id name")
            .populate("likes", "_id name")
            .sort("-createdAt")
            .paginate(postOptions);
    };
    cratePost = async (postBody: Partial<PostType>) => {
        return await Post.create(postBody);
    };

    updatePost = async (postId: string, postBody: Partial<PostType>) => {
        return await Post.findByIdAndUpdate(postId, postBody, { new: true });
    };
    findByUserId = async (userId: string) => {
        return await Post.find({ postedBy: userId })
            .populate("postedBy", "_id name")
            .populate("comments.postedBy", "_id name")
            .populate("likes", "_id name")
            .sort("-createdAt");
    };
    findById = async (postId: string) => {
        return await Post.findById(postId);
    };

    findByIdAndDelete = async (postId: string) => {
        return await Post.findByIdAndDelete(postId);
    };

    comment = async (postId: string, comment: CommentType) => {
        return await Post.findByIdAndUpdate(
            postId,
            { $push: { comments: comment } },
            { new: true },
        )
            .populate("comments.postedBy", "_id name")
            .populate("postedBy", "_id name")
            .exec();
    };

    uncomment = async (postId: string, commentId: string) => {
        return await Post.findByIdAndUpdate(
            postId,
            { $pull: { comments: { _id: commentId } } },
            { new: true },
        )
            .populate("comments.postedBy", "_id name")
            .populate("postedBy", "_id name")
            .exec();
    };

    like = async (postId: string, userId: string) => {
        return await Post.findByIdAndUpdate(
            postId,
            { $addToSet: { likes: userId } },
            { new: true },
        );
    };
    unlike = async (postId: string, userId: string) => {
        return await Post.findByIdAndUpdate(
            postId,
            { $pull: { likes: userId } },
            { new: true },
        );
    };
}
