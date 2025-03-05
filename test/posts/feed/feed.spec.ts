import supertest from "supertest";
import app from "../../../src/app";
import { db } from "../../../src/utils/db";
import {
  DELETED_USER_ID,
  addFollowing,
  createAccessToken,
  createPost,
  createUser,
  userData,
} from "../../testHelpers";

const api = supertest(app);
const BASE_URL = `/posts/feed/user`;
describe("GET /posts/feed/user/:userId", () => {
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
    it("should return status 200 , and the posts by the people the user is following", async () => {
      const savedUser = await createUser(userData);
      const otherUser = await createUser({
        ...userData,
        email: "other_user@gmail.com",
      });

      const userId = savedUser._id.toString();
      const otherUserId = otherUser._id.toString();

      const accessToken = await createAccessToken({ _id: userId });

      await addFollowing(savedUser, otherUser);

      const savedPost = await createPost({
        text: "original_text",
        postedBy: otherUserId,
      });

      const response = await api
        .get(`${BASE_URL}/${userId}`)
        .set("Cookie", [`accessToken=${accessToken}`])
        .expect(200);

      expect(response.body.posts[0].id).toEqual(savedPost._id.toString());

      expect(response.body.posts.length).toBe(1);
    });
  });

  describe("unhappy path", () => {
    it("should return 401 if auth token is missing", async () => {
      const savedUser = await createUser(userData);

      const userId = savedUser._id.toString();

      await api.get(`${BASE_URL}/${userId}`).expect(401);
    });
    it("should return status 404 if user with given userId does not exist", async () => {
      const userId = DELETED_USER_ID;

      const accessToken = await createAccessToken({ _id: userId });

      await api
        .get(`${BASE_URL}/${userId}`)
        .set("Cookie", [`accessToken=${accessToken}`])
        .expect(404);
    });
  });
});
