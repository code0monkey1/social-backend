import supertest from "supertest";
import app from "../../../src/app";
import {
  createAccessToken,
  createPost,
  createUser,
  deletePost,
  getPostById,
  userData,
} from "../../testHelpers";
import { db } from "../../../src/utils/db";
import Post from "../../../src/models/post.model";

const api = supertest(app);
describe("PUT /posts/:postId/like", () => {
  beforeAll(async () => {
    await db.connect();
  });
  beforeEach(async () => {
    await db.clear();
  });
  afterAll(async () => {
    await db.disconnect();
  });

  describe("happy path", () => {
    it("should return json response", async () => {
      const BASE_URL = getBaseUrl("1");

      await api.put(BASE_URL).expect("Content-Type", /json/);
    });

    it("should return status 200 , and allow user to like a post", async () => {
      const user = await createUser(userData);
      const anotherUser = await createUser({
        ...userData,
        email: "other_user@gmail.com",
      });

      const post = await createPost({
        postedBy: anotherUser._id.toString(),
        text: "original_text",
      });

      const BASE_URL = getBaseUrl(post._id.toString());

      const accessToken = await createAccessToken(user);

      const response = await api
        .put(BASE_URL)
        .set("Cookie", [`accessToken=${accessToken}`])
        .expect(201);

      expect(response.body.likes.length).toBe(1);
      expect(response.body.likes[0].toString()).toBe(user._id.toString());
    });
  });

  describe("unhappy path", () => {
    it("should return 401 response in case auth not provided", async () => {
      const user = await createUser(userData);
      const anotherUser = await createUser({
        ...userData,
        email: "other_user@gmail.com",
      });

      const post = await createPost({
        postedBy: anotherUser._id.toString(),
        text: "original_text",
      });

      const BASE_URL = getBaseUrl(post._id.toString());

      await api.put(BASE_URL).expect(401);
    });

    it("should not allow user to like a post more than once", async () => {
      const user = await createUser(userData);

      const otherUser = await createUser({
        ...userData,
        email: "other_user@gmail.com",
      });

      const post = await createPost({
        postedBy: user._id.toString(),
        text: "original_text",
      });

      await Post.findByIdAndUpdate(
        post._id.toString(),
        { $addToSet: { likes: otherUser._id.toString() } },
        { new: true },
      );

      const BASE_URL = getBaseUrl(post._id.toString());

      const accessToken = await createAccessToken(otherUser);

      const response = await api
        .put(BASE_URL)
        .set("Cookie", [`accessToken=${accessToken}`])
        .expect(201);

      expect(response.body.likes.length).toBe(1);
      expect(response.body.likes[0].toString()).toBe(otherUser._id.toString());
    });

    it("should not allow user to like their own post", async () => {
      const user = await createUser(userData);

      const post = await createPost({
        postedBy: user._id.toString(),
        text: "original_text",
      });

      const BASE_URL = getBaseUrl(post._id.toString());

      const accessToken = await createAccessToken(user);

      const response = await api
        .put(BASE_URL)
        .set("Cookie", [`accessToken=${accessToken}`])
        .expect(403);

      const updatedPost = await getPostById(post._id.toString());

      expect(updatedPost?.likes.length).toBe(0);
    });

    it("should return status 400 if post does not exist", async () => {
      const user = await createUser(userData);

      const post = await createPost({
        postedBy: user._id.toString(),
        text: "original_text",
      });

      const BASE_URL = getBaseUrl(post._id.toString());

      const accessToken = await createAccessToken(user);

      await deletePost(post._id.toString());

      await api
        .put(BASE_URL)
        .set("Cookie", [`accessToken=${accessToken}`])
        .expect(404);
    });
  });
});

const getBaseUrl = (postId: string) => {
  const BASE_URL = `/posts/${postId}/like`;
  return BASE_URL;
};
