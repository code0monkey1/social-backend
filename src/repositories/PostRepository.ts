import Post, { CommentType, PostType } from "../models/post.model";

export class PostRepository {
    cratePost = async (postBody: Partial<PostType>) => {
        return await Post.create(postBody);
    };

    updatePost = async (postId: string, postBody: Partial<PostType>) => {
        return await Post.findByIdAndUpdate(postId, postBody, { new: true });
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
}
