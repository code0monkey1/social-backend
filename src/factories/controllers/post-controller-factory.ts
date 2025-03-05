import { PostController } from "../../controllers/PostController";
import { PostRepository } from "../../repositories/PostRepository";
import { PostService } from "../../services/PostService";

export const makePostController = () => {
  const postRepository = new PostRepository();
  const postService = new PostService(postRepository);
  return new PostController(postService);
};
