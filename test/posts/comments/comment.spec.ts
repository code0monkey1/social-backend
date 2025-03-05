import supertest from "supertest";
import app from "../../../src/app";
import { db } from "../../../src/utils/db";
import {
  createAccessToken,
  createPost,
  createUser,
  deletePost,
  userData,
} from "../../testHelpers";

const api = supertest(app);

describe("PUT /posts/:postId/comment", () => {
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
    it("should return json data", async () => {
      const BASE_URL = getBaseUrl("1");

      await api.put(BASE_URL).expect("Content-Type", /json/);
    });
    it("should return status 201 and update a new comment to post", async () => {
      const user = await createUser(userData);

      const post = await createPost({
        text: "original_text",
        postedBy: user._id.toString(),
      });

      const BASE_URL = getBaseUrl(post._id.toString());

      const accessToken = await createAccessToken(user);

      const response = await api
        .put(BASE_URL)
        .send({
          text: "my first comment",
          postedBy: user._id.toString(),
        })
        .set("Cookie", [`accessToken=${accessToken}`])
        .expect(201);

      expect(response.body.comments?.length).toBe(1);
      expect(response.body.comments?.[0].text).toBe("my first comment");
    });
  });

  describe("unhappy path", () => {
    it("should return 401 unauthorized , in case an token is not supplied", async () => {
      const user = await createUser(userData);

      const post = await createPost({
        text: "original_text",
        postedBy: user._id.toString(),
      });

      const BASE_URL = getBaseUrl(post._id.toString());

      await api.put(BASE_URL).expect(401);
    });
    it("should return 400 if the objectId of postId is of invalid type", async () => {
      const post = await createPost({
        text: "original_text",
        postedBy: "23432423",
      });

      const BASE_URL = getBaseUrl("invalid_post_id");

      const accessToken = await createAccessToken({ _id: "23423" });

      await api
        .put(BASE_URL)
        .set("Cookie", [`accessToken=${accessToken}`])
        .send({
          text: "my first comment",
          postedBy: "invalid",
        })
        .expect(400);
    });
    it("should return 404 if post with given postId does not exist", async () => {
      const user = await createUser(userData);

      const post = await createPost({
        text: "original_text",
        postedBy: user._id.toString(),
      });

      await deletePost(post._id.toString());

      const BASE_URL = getBaseUrl(post._id.toString());

      const accessToken = await createAccessToken(user);

      await api
        .put(BASE_URL)
        .send({
          text: "my first comment",
          postedBy: user._id.toString(),
        })
        .set("Cookie", [`accessToken=${accessToken}`])
        .expect(404);
    });
    it("should return status 400 , and not allow posting of comment with missing text field", async () => {
      const user = await createUser(userData);

      const post = await createPost({
        text: "original_text",
        postedBy: user._id.toString(),
      });

      const BASE_URL = getBaseUrl(post._id.toString());

      const accessToken = await createAccessToken(user);

      await api
        .put(BASE_URL)
        .send({
          postedBy: user._id.toString(),
        })
        .set("Cookie", [`accessToken=${accessToken}`])
        .expect(400);
    });

    it("should return status 400 , and not allow posting of comment with empty postedBy field", async () => {
      const user = await createUser(userData);

      const post = await createPost({
        text: "original_text",
        postedBy: user._id.toString(),
      });

      const BASE_URL = getBaseUrl(post._id.toString());

      const accessToken = await createAccessToken(user);

      await api
        .put(BASE_URL)
        .send({
          text: "",
        })
        .set("Cookie", [`accessToken=${accessToken}`])
        .expect(400);
    });
  });
});

const getBaseUrl = (postId: string) => {
  const BASE_URL = `/posts/${postId}/comment`;
  return BASE_URL;
};
