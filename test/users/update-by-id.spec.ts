import supertest from "supertest";
import app from "../../src/app";
import { db } from "../../src/utils/db";
const api = supertest(app);
import {
    createAccessToken,
    createUser,
    deleteUser,
    getUserById,
    userData,
} from "../testHelpers";

const BASE_URL = "/users/";

describe("UPDATE /users/:userId", () => {
    beforeAll(async () => {
        await db.connect();
    });

    afterAll(async () => {
        await db.disconnect();
    });

    afterEach(async () => {
        // delete all users created
        await db.clear();
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

        it("should return 404 if the user is not found", async () => {
            const savedUser = await createUser(userData);
            const userId = savedUser._id.toString();
            const accessToken = await createAccessToken(savedUser);

            await deleteUser(userId);

            await api
                .patch(`${BASE_URL}/${userId}`)
                .set("Cookie", [`accessToken=${accessToken}`])
                .send({
                    username: "test",
                })
                .expect(404);
        });

        // DONE: correct this test
        it("should not permit uploading non-image files for profile pic ", async () => {
            const user = await createUser(userData);
            const userId = user?._id.toString();
            const accessToken = await createAccessToken(user);

            await api
                .patch(`${BASE_URL}/${user?._id.toString()}`)
                .set("Cookie", [`accessToken=${accessToken}`])
                .attach("file", `${__dirname}/test-data/fake-text-pic.png`)
                .expect(400);

            const { avatar } = await getUserById(userId);

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
            const user = await createUser(userData);
            const userId = user._id.toString();
            const accessToken = await createAccessToken(user);

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
            const user = await createUser(userData);
            const userId = user._id.toString();
            const accessToken = await createAccessToken(user);

            const response = await api
                .patch(`${BASE_URL}/${userId}`)
                .set("Cookie", [`accessToken=${accessToken}`])
                .attach("file", `${__dirname}/test-data/test-pic.png`)
                .expect(200);

            const savedUser = await getUserById(userId);

            expect(savedUser?.avatar?.data).toBeInstanceOf(Buffer); // Verify that the file was uploaded
            expect(savedUser?.avatar?.contentType).toBe("image/png");
        }, 1000000);

        it("should update description , if present", async () => {
            const user = await createUser(userData);
            const userId = user._id.toString();

            const accessToken = await createAccessToken(user);

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
