import { PostType } from "../models/post.model";
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
}
