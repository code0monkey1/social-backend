import supertest from "supertest";
import app from "../../src/app";
import { db } from "../../src/utils/db";
import {
  DELETED_USER_ID,
  createAccessToken,
  createPost,
  createUser,
  userData,
} from "../testHelpers";

const api = supertest(app);

describe("GET /posts/by/user/:userId", () => {
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
    it("should return status 200 , and the posts by the user", async () => {
      const savedUser = await createUser(userData);

      const userId = savedUser._id.toString();

      const accessToken = await createAccessToken({ _id: userId });

      const savedPost = await createPost({
        text: "original_text",
        postedBy: userId,
      });

      const BASE_URL = `/posts/by/user/${userId}`;

      const response = await api
        .get(BASE_URL)
        .set("Cookie", [`accessToken=${accessToken}`])
        .expect(200);

      expect(response.body[0].id.toString()).toBe(savedPost._id.toString());

      expect(response.body.length).toBe(1);
    });
  });

  describe("unhappy path", () => {
    it("should return 401 if auth token is missing", async () => {
      const savedUser = await createUser(userData);

      const userId = savedUser._id.toString();

      await api.get(`/posts/by/user/${userId}`).expect(401);
    });
    it("should return status 404 if user with given userId does not exist", async () => {
      const userId = DELETED_USER_ID;

      const accessToken = await createAccessToken({ _id: userId });

      await api
        .get(`/posts/by/user/${userId}`)
        .set("Cookie", [`accessToken=${accessToken}`])
        .expect(404);
    });
  });
});
