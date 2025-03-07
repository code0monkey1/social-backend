import { createAccessToken, getPostById } from "../testHelpers/index";
import supertest from "supertest";
import app from "../../src/app";
import {
  DELETED_USER_ID,
  createPost,
  createUser,
  userData,
} from "../testHelpers";
import { db } from "../../src/utils/db";

const api = supertest(app);

describe("delete posts/:postId", () => {
  beforeAll(async () => {
    await db.connect();
  });

  afterEach(async () => {
    await db.clear();
  });

  afterAll(async () => {
    await db.disconnect();
  });

  describe("happy path", () => {
    it("should return json response", async () => {
      const BASE_URL = getBaseUrl("1");
      await api.delete(BASE_URL).expect("Content-Type", /json/);
    });
    it("should delete post when user is authorized to delete post", async () => {
      const user = await createUser(userData);

      const accessToken = await createAccessToken(user);

      const post = await createPost({
        postedBy: user._id.toString(),
        text: "original_text",
      });

      const BASE_URL = getBaseUrl(post._id.toString());

      const postBefore = await getPostById(post._id.toString());

      expect(postBefore?._id.toString()).toBe(post._id.toString());

      await api
        .delete(BASE_URL)
        .set("Cookie", `accessToken=${accessToken}`)
        .expect(200);

      const postAfter = await getPostById(post._id.toString());

      expect(postAfter).toBeNull();
    });
  });

  describe("unhappy path", () => {
    it("should return 401 , when auth token not provided", async () => {
      const user = await createUser(userData);

      const post = await createPost({
        postedBy: user._id.toString(),
        text: "original_text",
      });

      const BASE_URL = getBaseUrl(post._id.toString());
      await api.delete(BASE_URL).expect(401);
    });

    it("should return status 403 , not delete post when user is not authorized to delete post", async () => {
      const user = await createUser(userData);

      const accessToken = await createAccessToken(user);

      const post = await createPost({
        postedBy: DELETED_USER_ID,
        text: "original_text",
      });

      const BASE_URL = getBaseUrl(post._id.toString());

      await api
        .delete(BASE_URL)
        .set("Cookie", `accessToken=${accessToken}`)
        .expect(403);
    });

    it("should return 400 status , when postId is invalid", async () => {
      const user = await createUser(userData);

      const accessToken = await createAccessToken(user);

      const post = await createPost({
        postedBy: DELETED_USER_ID,
        text: "original_text",
      });

      const BASE_URL = getBaseUrl("123");

      await api
        .delete(BASE_URL)
        .set("Cookie", `accessToken=${accessToken}`)
        .expect(400);
    });
  });
});

export const getBaseUrl = (postId: string) => {
  const BASE_URL = `/posts/${postId}`;
  return BASE_URL;
};
