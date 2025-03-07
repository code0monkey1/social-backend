import supertest from "supertest";
import app from "../../src/app";
import { db } from "../../src/utils/db";
import bcrypt from "bcryptjs";
import {
  getAllUsers,
  userData,
  shouldHaveValidTokensInCookies,
  assertIsUserPassword,
  createUser,
  getAllRefreshTokens,
  getUserById,
} from "../testHelpers";
import { IndexDefinition } from "mongoose";
import User from "../../src/models/user.model";

describe("POST /auth/register", () => {
  const api = supertest(app);
  const BASE_URL = "/auth/register";

  beforeAll(async () => {
    await db.connect();
  });

  beforeEach(async () => {
    // delete all users created
    await db.clear();
  });
  afterAll(async () => {
    // disconnect db
    await db.disconnect();
  });

  describe("when user data is valid ", () => {
    it("should return 400 status code , when no body provided", async () => {
      await api.post(BASE_URL).expect(400);
    });

    it("should return valid json response", async () => {
      await api
        .post(BASE_URL)
        .send(userData)
        .expect("Content-Type", /application\/json/);
    });

    it("should return status 201,user should be created ", async () => {
      await api.post(BASE_URL).send(userData).expect(201);
      const users = await getAllUsers();
      expect(users.length).toBe(1);
      expect(users[0].name).toBe(userData.name);
      expect(users[0].email).toBe(userData.email);
    });

    it("should store hashed password in the database", async () => {
      //arrange

      //act
      await api.post(BASE_URL).send(userData).expect("Content-Type", /json/);

      const users = await getAllUsers();

      //assert
      expect(users).toHaveLength(1);

      //check user is the same

      assertIsUserPassword(userData.password, users[0].hashedPassword);
    });

    it("should return accessToken and refreshToken cookies in response header", async () => {
      //arrange

      //act
      const response = await api.post(BASE_URL).send(userData).expect(201);

      await shouldHaveValidTokensInCookies(response);
    });

    it("should register a new user with name same as password , and email to be name@guest_email.com", async () => {
      const response = await api
        .post(BASE_URL)
        .send({ role: "guest" })
        .expect(201);

      const user = await getUserById(response.body);

      expect(user.role).toBe("guest");

      // the name is the password
      expect(bcrypt.compare(userData.name, user.hashedPassword)).toBeTruthy();

      expect(user.email).toBe(`${user.name}@guest_email.com`);
    });

    it("should have expireAfterSeconds set to one day for guest user", async () => {
      const EXPIRE_IN_A_SECOND = 1;
      // Create the index
      await User.collection.createIndex(
        { createdAt: 1 },
        {
          expireAfterSeconds: EXPIRE_IN_A_SECOND,
          partialFilterExpression: { role: "guest" },
        },
      );

      // Find the index with the desired name
      const createdAtIndex = (
        await User.collection.listIndexes().toArray()
      ).find(
        (index: IndexDefinition) =>
          typeof index.key === "object" &&
          "createdAt" in index.key &&
          (index.key as { createdAt: number }).createdAt === 1,
      ) as IndexDefinition | undefined;

      // Assert that the expireAfterSeconds is set to one day
      expect(createdAtIndex?.expireAfterSeconds).toBe(EXPIRE_IN_A_SECOND);
    });

    it("should store the refreshToken reference in the database,with created userId ", async () => {
      //act
      const response = await api.post(BASE_URL).send(userData).expect(201);

      const refreshTokens = await getAllRefreshTokens();

      expect(refreshTokens).toHaveLength(1);

      expect(refreshTokens[0].user.toString()).toBe(response.body);
      // verify expiry
      expect(refreshTokens[0].expiresAt).toBeDefined();

      const oneYearFromNow = new Date();
      oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 0.99);

      const expectedExpiry =
        refreshTokens[0].expiresAt.getTime() > oneYearFromNow.getTime();

      expect(expectedExpiry).toBeTruthy();
    });
  });
  describe("when user data is invalid", () => {
    describe("when user already exists", () => {
      it("should return 400 status code , if email exists", async () => {
        //arrange
        await createUser(userData);

        const usersBefore = await getAllUsers();
        //act // assert
        await api.post(BASE_URL).send(userData).expect(400);

        const usersAfter = await getAllUsers();

        expect(usersBefore.length).toBe(usersAfter.length);
      });
    });

    describe("validation errors", () => {
      it("should return 400 status code , if password is less than 8 chars exists", async () => {
        //arrange

        //act // assert
        const result = await api
          .post(BASE_URL)
          .send({ ...userData, password: "1234567" })
          .expect(400);

        expect(result.body.errors).toHaveLength(1); // Expecting one validation error
        expect(result.body.errors[0].msg).toBe(
          "Password must be at least 8 characters long",
        );
      });

      it("should return 400 status code , if email is invalid", async () => {
        //arrange
        //act
        // assert
        const result = await api
          .post(BASE_URL)
          .send({ ...userData, email: "invalid_email" })
          .expect(400);

        expect(result.body.errors).toHaveLength(1); // Expecting one validation error
        expect(result.body.errors[0].msg).toBe("Email should be valid");
      });
    });
  });
});
