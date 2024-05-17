import { createUser, userData } from "./../testHelpers/index";
import { db } from "../../src/utils/db";
import supertest from "supertest";
import app from "../../src/app";
const api = supertest(app);
import { UserRepository } from "../../src/repositories/UserRepository";
import { isJwt } from "../../src/utils/index";
import { clearDb } from "../testHelpers";
const BASE_URL = "/auth/login";
let userRepository: UserRepository;

describe("POST /auth/login", () => {
    beforeAll(async () => {
        await db.connect();
        userRepository = new UserRepository();
    });

    afterEach(async () => {
        // delete all users created
        await clearDb();
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
            const response = await api
                .post(BASE_URL)
                .send(userData)
                .expect(201);

            interface Headers {
                ["set-cookie"]: string[];
            }

            let accessToken = "";
            let refreshToken = "";

            // assert
            expect(response.headers["set-cookie"]).toBeDefined();

            const cookies =
                (response.headers as unknown as Headers)["set-cookie"] || [];

            cookies.forEach((c) => {
                if (c.startsWith("accessToken="))
                    accessToken = c.split(";")[0].split("=")[1];
                if (c.startsWith("refreshToken="))
                    refreshToken = c.split(";")[0].split("=")[1];
            });

            expect(accessToken).toBeTruthy();
            expect(refreshToken).toBeTruthy();

            expect(isJwt(accessToken)).toBeTruthy();
            expect(isJwt(refreshToken)).toBeTruthy();
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

            const users = await userRepository.findAll();
            expect(users).toHaveLength(1);

            expect(users[0].hashedPassword).toBeDefined();
        });

        it("should return 400 if password is incorrect ", async () => {
            await createUser(userData);

            await api
                .post(BASE_URL)
                .send({ ...userData, password: "other_password" })
                .expect(400);

            const users = await userRepository.findAll();
            expect(users).toHaveLength(1);

            expect(users[0].hashedPassword).toBeDefined();
        });
    });
});
