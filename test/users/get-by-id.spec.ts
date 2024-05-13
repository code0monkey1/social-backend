import supertest from "supertest";
import app from "../../src/app";
import { db } from "../../src/utils/db";
const api = supertest(app);
import User from "../../src/models/user.model";
import RefreshToken from "../../src/models/refresh.token.model";
import { createAccessToken, createUser } from "../auth/helper";
import { Config } from "../../src/config";
const BASE_URL = "/users";
import jwt from "jsonwebtoken";
import { UserRepository } from "../../src/repositories/UserRepository";
let userRepository: UserRepository;
describe("GET /users/:userId", () => {
    beforeAll(async () => {
        userRepository = new UserRepository();

        await db.connect();
    });

    afterAll(async () => {
        await db.disconnect();
    });

    afterEach(async () => {
        // delete all users created
        await User.deleteMany({});
        await RefreshToken.deleteMany({});
    });

    describe("unhappy path", () => {
        it("should return 401 if no accessToken is provided", async () => {
            const userId = "1";
            await api.get(`${BASE_URL}/${userId}`).expect(401);
        });

        it("should return 401 if user with userId in accessToken is not same as the param userId", async () => {
            const user = {
                name: "test",
                email: "test@gmail",
                password: "test",
            };

            const savedUser = await createUser(user);

            const anotherUser = await createUser({
                ...user,
                name: "test2",
                email: "test2@gmail",
            });

            const accessToken = await createAccessToken(savedUser);

            await api
                .get(`${BASE_URL}/${anotherUser._id.toString()}`)
                .set("Cookie", [`accessToken=${accessToken}`])
                .expect(401);
        });

        it("should return 400 if userId is of invalid type", async () => {
            const user = {
                name: "test",
                email: "test@gmail",
                password: "test",
            };

            const savedUser = await createUser(user);

            const accessToken = await createAccessToken(savedUser);

            await api
                .get(`${BASE_URL}/2`)
                .set("Cookie", [`accessToken=${accessToken}`])
                .expect(400);
        });

        it("should return 401 if accessToken is invalid", async () => {
            const user = {
                name: "test",
                email: "test@gmail",
                password: "test",
            };

            const savedUser = await createUser(user);

            await api
                .get(`${BASE_URL}/${savedUser._id.toString()}`)
                .set("Cookie", [`accessToken=234`])
                .expect(401);
        });

        it("should return 401 if accessToken is expired", async () => {
            const user = {
                name: "test",
                email: "test@gmail",
                password: "test",
            };
            const savedUser = await createUser(user);

            const accessToken = await jwt.sign(
                {
                    userId: savedUser._id.toString(),
                },
                Config.JWT_SECRET!,
                {
                    expiresIn: "0.1s",
                },
            );

            await api
                .get(`${BASE_URL}/${savedUser._id.toString()}`)
                .set("Cookie", [`accessToken=${accessToken}`])
                .expect("Content-Type", /json/)
                .expect(401);
        });

        it("should return 404 when user does not exist", async () => {
            const user = {
                name: "test",
                email: "test@gmail.com",
                password: "testfhsr",
            };

            const createdUser = await createUser(user);

            const accessToken = await createAccessToken(createdUser);

            await userRepository.deleteById(createdUser._id.toString());

            await api
                .get(`${BASE_URL}/${createdUser._id.toString()}`)
                .set("Cookie", [`accessToken=${accessToken}`])
                .expect(404);
        });
    });

    describe("happy path", () => {
        it("should return json response", async () => {
            const userId = "1";
            await api
                .get(`${BASE_URL}/${userId}`)
                .expect("Content-Type", /json/);
        });

        it("should return status 200 and get the user by userId in the request", async () => {
            const user = {
                name: "test",
                email: "test@gmail.com",
                password: "testfhsr",
            };
            const createdUser = await createUser(user);

            const accessToken = await createAccessToken(createdUser);

            const response = await api
                .get(`${BASE_URL}/${createdUser._id.toString()}`)
                .set("Cookie", [`accessToken=${accessToken}`])
                .expect(200);

            expect(response.body.name).toBe(user.name);
            expect(response.body.email).toBe(user.email);
        });
    });
});
