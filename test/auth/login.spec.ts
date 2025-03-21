import {
  createUser,
  getAllUsers,
  shouldHaveValidTokensInCookies,
  userData,
} from "./../testHelpers/index";
import { db } from "../../src/utils/db";
import supertest from "supertest";
import app from "../../src/app";
const api = supertest(app);
const BASE_URL = "/auth/login";

describe("POST /auth/login", () => {
  beforeAll(async () => {
    await db.connect();
  });

  afterEach(async () => {
    // delete all users created
    await db.clear();
  });

  afterAll(async () => {
    // disconnect db
    await db.disconnect();
  });

  describe("when data is valid", () => {
    it("should return refreshToken and accessToken cookies inside response objects", async () => {
      //arrange

      await createUser(userData);

      //act
      const response = await api.post(BASE_URL).send(userData).expect(200);

      await shouldHaveValidTokensInCookies(response);
    });
  });

  describe("when data is invalid ", () => {
    it("should return 400 status code , when no body provided", async () => {
      await api.post(BASE_URL).expect(400);
    });

    it("should return status 400 when  password not sent in request body", async () => {
      //arrange
      //act
      //assert
      await api
        .post(BASE_URL)
        .send({
          email: "vonnaden@gmail.com",
        })
        .expect(400);
    });

    it("should return 400 if email is not registered ", async () => {
      await createUser(userData);

      await api
        .post(BASE_URL)
        .send({ ...userData, email: "other_email@gmail.com" })
        .expect(400);

      const users = await getAllUsers();
      expect(users).toHaveLength(1);

      expect(users[0].hashedPassword).toBeDefined();
    });

    it("should return 400 if password is incorrect ", async () => {
      await createUser(userData);

      await api
        .post(BASE_URL)
        .send({ ...userData, password: "other_password" })
        .expect(400);

      const users = await getAllUsers();
      expect(users).toHaveLength(1);

      expect(users[0].hashedPassword).toBeDefined();
    });
  });
});
