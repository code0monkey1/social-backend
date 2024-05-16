import { UserType } from "./../../src/models/user.model";
import jwt from "jsonwebtoken";
import supertest from "supertest";
import app from "../../src/app";
import { db } from "../../src/utils/db";
import { makeUserService } from "../../src/factories/services/user-service-factory";
const api = supertest(app);
const BASE_URL = "/users/";
import User from "../../src/models/user.model";
import { Config } from "../../src/config";
import RefreshToken from "../../src/models/refresh.token.model";
const userService = makeUserService();
let user: any;

describe("UPDATE /users/:userId", () => {
    beforeAll(async () => {
        await db.connect();
    });

    afterAll(async () => {
        await db.disconnect();
    });

    beforeEach(async () => {
        // delete all users created
        user = await createUser();
    });

    afterEach(async () => {
        // delete all users created
        await User.deleteMany({});
        await RefreshToken.deleteMany({});
    });

    describe("sad path", () => {
        it("should return 401 if no accessToken is provided", async () => {
            const userId = "123";
            await api
                .patch(`${BASE_URL}/${userId}`)
                .send({
                    username: "test",
                })
                .expect(401);
        });

        it("should return 401 if user with userId in accessToken is not same as the param userId ", async () => {
            // arrange
            const userId = "663f0f5379ab100cdd57882e";
            const accessToken = await getAccessToken(userId);
            //act

            //assert
            await api
                .patch(`${BASE_URL}/6641c748e2b52be16daf57fd`)
                .set("Cookie", [`accessToken=${accessToken}`])
                .send({
                    username: "test",
                })
                .expect(401);
        });

        it("should return 404 if the user is not found", async () => {
            const userId = "663e3f9ba78db81d5d3e00c8";
            const accessToken = await getAccessToken(userId);
            await api
                .patch(`${BASE_URL}/663e3f9ba78db81d5d3e00c8`)
                .set("Cookie", [`accessToken=${accessToken}`])
                .send({
                    username: "test",
                })
                .expect(404);
        });

        it("should return 400 if the userId is of invalid format", async () => {
            const userId = "123";
            const accessToken = await getAccessToken(userId);
            await api
                .patch(`${BASE_URL}/123`)
                .set("Cookie", [`accessToken=${accessToken}`])
                .send({
                    username: "test",
                })
                .expect(400);
        });
        // DONE: correct this test
        it("should not permit uploading non-image files for profile pic ", async () => {
            const userId = user?._id.toString();
            const accessToken = await getAccessToken(userId);

            await api
                .patch(`${BASE_URL}/${user?._id.toString()}`)
                .set("Cookie", [`accessToken=${accessToken}`])
                .attach("file", `${__dirname}/test-data/fake-text-pic.png`)
                .expect(400);

            const { avatar } = (await User.findById(userId)) as {
                avatar: {
                    data: Buffer;
                    contentType: string;
                };
            };

            expect(avatar).toEqual({});
        }, 100000);
    });

    describe("happy path", () => {
        it("should return json response", async () => {
            const userId = "124";

            await api
                .patch(`${BASE_URL}/${userId}`)
                .send({
                    username: "test",
                })
                .expect("Content-Type", /json/);
        });

        it("should update username ", async () => {
            const userId = user?._id.toString();
            const accessToken = await getAccessToken(userId);

            const result = await api
                .patch(`${BASE_URL}/${userId}`)
                .set("Cookie", [`accessToken=${accessToken}`])
                .send({
                    name: "updated_name",
                })
                .expect("Content-Type", /json/)
                .expect(200);

            expect(result.body.name).toBe("updated_name");
        });
        // DONE : should update user with profile pic
        it("should update user with profile pic", async () => {
            const userId = user?._id.toString();
            const accessToken = await getAccessToken(userId);

            const response = await api
                .patch(`${BASE_URL}/${userId}`)
                .set("Cookie", [`accessToken=${accessToken}`])
                .attach("file", `${__dirname}/test-data/test-pic.png`)
                .expect(200);

            const savedUser = await User.findById(userId);

            expect(savedUser?.avatar?.data).toBeInstanceOf(Buffer); // Verify that the file was uploaded
            expect(savedUser?.avatar?.contentType).toBe("image/png");
        }, 1000000);

        it("should update description , if present", async () => {
            const userId = user?._id.toString();
            const accessToken = await getAccessToken(userId);
            const about = "updated_description";
            const result = await api
                .patch(`${BASE_URL}/${userId}`)
                .set("Cookie", [`accessToken=${accessToken}`])
                .send({
                    about,
                })
                .expect("Content-Type", /json/)
                .expect(200);

            expect(result.body.about).toBe(about);
        });
    });
});

export const createUser = async () => {
    const usr = {
        name: "test",
        email: "test@gmail.com",
        password: "testing_right",
    };

    return await userService.createUser(usr.name, usr.email, usr.password);
};

const getAccessToken = async (userId: string) => {
    const accessToken = await jwt.sign(
        {
            userId,
        },
        Config.JWT_SECRET!,
        { expiresIn: "1h" },
    );

    return accessToken;
};
