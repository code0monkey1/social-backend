import supertest from "supertest";
import app from "../../src/app";
import bcrypt from "bcrypt";
import User from "../../src/models/user.model";
import RefreshToken from "../../src/models/refresh.token.model";
import { db } from "../../src/utils/db";
import { isJwt } from "../../src/utils";
import { UserRepository } from "../../src/repositories/UserRepository";

const api = supertest(app);
const BASE_URL = "/auth/register";

let userRepository: UserRepository;
describe("POST /auth/register", () => {
    beforeAll(async () => {
        await db.connect();
        userRepository = new UserRepository();
    });

    beforeEach(async () => {
        // delete all users created
        await User.deleteMany({});
        await RefreshToken.deleteMany({});
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
            const user = {
                name: "test",
                email: "test@gmail.com",
                password: "testing_right",
            };
            await api
                .post(BASE_URL)
                .send(user)
                .expect("Content-Type", /application\/json/);
        });

        it("should return status 201,user should be created ", async () => {
            const user = {
                name: "test",
                email: "test@gmail.com",
                password: "testfhsr",
            };
            await api.post(BASE_URL).send(user).expect(201);
            const users = await userRepository.findAll();
            expect(users.length).toBe(1);
            expect(users[0].name).toBe(user.name);
            expect(users[0].email).toBe(user.email);
        });

        it("should store hashed password in the database", async () => {
            //arrange
            const user = {
                name: "test",
                email: "test@gmail.com",
                password: "testfsda",
            };

            //act
            await api.post(BASE_URL).send(user).expect("Content-Type", /json/);

            const users = await userRepository.findAll();

            //assert
            expect(users).toHaveLength(1);

            //check user is the same

            expect(users[0].hashedPassword).toBeDefined();

            expect(
                await bcrypt.compare(user.password, users[0].hashedPassword),
            ).toBeTruthy();
        });

        it("should return accessToken and refreshToken cookies in response header", async () => {
            //arrange
            const user = {
                name: "test",
                email: "test@gmail.com",
                password: "testsadf",
            };

            //act
            const response = await api.post(BASE_URL).send(user).expect(201);

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

        it("should store the refreshToken reference in the database,with created userId ", async () => {
            const user = {
                name: "test",
                email: "test@gmail.com",
                password: "testsadf",
            };

            //act
            const response = await api.post(BASE_URL).send(user).expect(201);

            const refreshTokens = await RefreshToken.find();

            expect(refreshTokens).toHaveLength(1);

            expect(refreshTokens[0].user.toString()).toBe(
                response.body.user.id,
            );
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
                const user = {
                    name: "abcdef",
                    email: "c@gmail.com",
                    password: "test",
                };

                await userRepository.create({
                    ...user,
                    hashedPassword: await bcrypt.hash(user.password, 10),
                });

                const usersBefore = await userRepository.findAll();
                //act // assert
                await api.post(BASE_URL).send(user).expect(400);

                const usersAfter = await userRepository.findAll();

                expect(usersBefore.length).toBe(usersAfter.length);
            });
        });

        describe("validation errors", () => {
            it("should return 400 status code , if password is less than 8 chars exists", async () => {
                //arrange
                const user = {
                    name: "abcdef",
                    email: "c@gmail.com",
                    password: "test",
                };

                //act // assert
                const result = await api.post(BASE_URL).send(user).expect(400);

                expect(result.body.errors).toHaveLength(1); // Expecting one validation error
                expect(result.body.errors[0].msg).toBe(
                    "Password must be at least 8 characters long",
                );
            });

            it("should return 400 status code , if email is invalid", async () => {
                //arrange
                const user = {
                    name: "abcdef",
                    email: "cgmail.com",
                    password: "testdfas",
                };

                //act // assert
                const result = await api.post(BASE_URL).send(user).expect(400);

                expect(result.body.errors).toHaveLength(1); // Expecting one validation error
                expect(result.body.errors[0].msg).toBe("Email should be valid");
            });
        });
    });
});
