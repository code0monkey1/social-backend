import supertest from "supertest";
import app from "../../src/app";
import { db } from "../../src/utils/db";
import {
  createRefreshToken,
  createUser,
  deleteRefreshTokens,
  deleteUser,
  getSavedRefreshToken,
  persistRefreshToken,
  shouldBeDifferentRefreshTokens,
  shouldHaveValidTokensInCookies,
  userData,
} from "../testHelpers";

const api = supertest(app);
const BASE_URL = "/auth/refresh";

describe("POST /auth/refresh", () => {
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
    it("should return json response ", async () => {
      await api.post(BASE_URL).expect("Content-Type", /json/);
    });
    it("should return a new accessToken and refreshToken", async () => {
      const savedUser = await createUser(userData);

      //create a refresh token
      const prevRefreshToken = await createRefreshToken(
        savedUser._id.toString(),
      );
      //send refresh token
      const response = await api
        .post(BASE_URL)
        .set("Cookie", [`refreshToken=${prevRefreshToken}`])
        .expect(200);

      expect(shouldHaveValidTokensInCookies(response)).toBeTruthy();

      expect(
        shouldBeDifferentRefreshTokens(response, prevRefreshToken),
      ).toBeTruthy();
    });

    it("should delete the previous refreshToken", async () => {
      const savedUser = await createUser(userData);

      //create a refresh token
      const persistedRefreshToken = await persistRefreshToken(
        savedUser._id.toString(),
      );

      const refreshToken = await createRefreshToken(
        savedUser._id.toString(),
        persistedRefreshToken._id.toString(),
      );

      //send refresh token
      await api
        .post(BASE_URL)
        .set("Cookie", [`refreshToken=${refreshToken}`])
        .expect(200);

      const savedRefreshToken = await getSavedRefreshToken(
        persistedRefreshToken._id.toString(),
        savedUser._id.toString(),
      );

      expect(savedRefreshToken).toBeNull();
    });
  });

  describe("unhappy path", () => {
    it("should return 401 if refreshToken is not supplied in header", async () => {
      //send refresh token , but no auth token

      await api.post(BASE_URL).expect(401);
    });

    it("should return 401 status if refreshToken is not in db", async () => {
      const savedUser = await createUser(userData);
      const refreshToken = await createRefreshToken(savedUser._id.toString());

      //delete refresh token from db
      await deleteRefreshTokens();

      //attach deleted refresh token in cookie

      await api
        .post(BASE_URL)
        .set("Cookie", [`refreshToken=${refreshToken}`])
        .expect(401);
    });

    it("should return 404 status if user with given refreshToken does not exist", async () => {
      const savedUser = await createUser(userData);

      const refreshToken = await createRefreshToken(savedUser._id.toString());

      // delete user from db
      await deleteUser(savedUser._id.toString());

      await api
        .post(BASE_URL)
        .set("Cookie", [`refreshToken=${refreshToken}`])
        .expect(404);
    });
  });
});
