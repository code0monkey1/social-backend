import Post, { PostType } from "../models/post.model";

export class PostRepository {
    cratePost = async (postBody: Partial<PostType>) => {
        return await Post.create(postBody);
    };

    updatePost = async (postId: string, postBody: Partial<PostType>) => {
        return await Post.findByIdAndUpdate(postId, postBody, { new: true });
    };
}
