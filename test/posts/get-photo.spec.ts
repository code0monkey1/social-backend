import {
  createAccessToken,
  createPost,
  createUser,
  userData,
} from "./../testHelpers/index";
import { db } from "../../src/utils/db";
import supertest from "supertest";
import app from "../../src/app";
import { DELETED_USER_ID } from "../testHelpers";
import fs from "fs";
import path from "path";

const api = supertest(app);
describe("GET  /posts/:postId/photo ", () => {
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

      await api.get(BASE_URL).expect("Content-Type", /json/);
    });

    it("should return the photo of the post", async () => {
      const user = await createUser(userData);

      let fileData = fs.readFileSync(
        path.resolve(__dirname, "../test-data/test-pic.png"),
      );

      const photo = {
        data: fileData,
        contentType: "image/png", // replace it with actual contentType
      };

      const post = await createPost({
        postedBy: user._id.toString(),
        text: "some_text",
        photo,
      });

      const BASE_URL = getBaseUrl(post._id.toString());

      const accessToken = await createAccessToken(user);

      const response = await api
        .get(BASE_URL)
        .set("Cookie", `accessToken=${accessToken}`)
        .expect("Content-Type", photo.contentType)
        .expect(200);

      expect(response.body).toBeDefined();
      const responseBuffer = Buffer.from(response.body, "base64");
      const originalBuffer = Buffer.from(
        photo.data.toString("base64"),
        "base64",
      );
      expect(Buffer.compare(responseBuffer, originalBuffer)).toEqual(0);
    });

    it("should null if no photo is present in the post ", async () => {
      const user = await createUser(userData);

      const post = await createPost({
        postedBy: user._id.toString(),
        text: "some_text",
      });

      const BASE_URL = getBaseUrl(post._id.toString());

      const accessToken = await createAccessToken(user);

      const response = await api
        .get(BASE_URL)
        .set("Cookie", `accessToken=${accessToken}`)
        .expect(200);

      expect(response.body.data).toBeUndefined();
      expect(response.body.contentType).toBeUndefined();
    });
  });

  describe("unhappy path", () => {
    it("should return 401 unauthorized , in case an token is not supplied", async () => {
      const user = await createUser(userData);

      const post = await createPost({
        postedBy: user._id.toString(),
        text: "some_text",
      });

      const BASE_URL = getBaseUrl(post._id.toString());

      await api.get(BASE_URL).expect(401);
    });

    it("should return 404 , in case the post is not found", async () => {
      const postId = DELETED_USER_ID;

      const user = await createUser(userData);
      const BASE_URL = getBaseUrl(postId);

      const accessToken = await createAccessToken(user);

      await api
        .get(BASE_URL)
        .set("Cookie", `accessToken=${accessToken}`)
        .expect(404);
    });
  });
});

const getBaseUrl = (postId: string) => {
  const BASE_URL = `/posts/${postId}/photo`;
  return BASE_URL;
};
