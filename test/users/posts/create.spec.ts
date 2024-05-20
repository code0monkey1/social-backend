import {
    DELETED_USER_ID,
    createAccessToken,
    createUser,
    getPostById,
    userData,
} from "./../../testHelpers/index";
import { db } from "../../../src/utils/db";
import supertest from "supertest";
import app from "../../../src/app";

const api = supertest(app);
describe("POST /users/:userId/posts", () => {
    beforeAll(async () => {
        await db.connect();
    });
    beforeEach(async () => {
        await db.clear();
    });
    afterAll(async () => {
        await db.disconnect();
    });

    describe("happy path", () => {
        it("should return json response", async () => {
            const userId = "1";
            const BASE_URL = getBaseUrl(userId);
            await api
                .post(BASE_URL)
                .send({
                    title: "test",
                    body: "test",
                })
                .expect("Content-Type", /json/);
        });

        it("should return 201 if post is created successfully", async () => {
            const user = await createUser(userData);
            const accessToken = await createAccessToken(user);
            const userId = user._id.toString();
            const BASE_URL = getBaseUrl(userId);

            // set access token as cookie
            const response = await api
                .post(BASE_URL)
                .set("Cookie", `accessToken=${accessToken}`)
                .field("text", "hello")
                .field("postedBy", userId);

            expect(response.body.text).toBe("hello");
            expect(response.body.postedBy).toBe(userId);
        });
        //DONE: add  photo attribute
        it("should have photo attribute set to Buffer type ,if photo is provided", async () => {
            const user = await createUser(userData);
            const accessToken = await createAccessToken(user);
            const userId = user._id.toString();
            const BASE_URL = getBaseUrl(userId);

            // set access token as cookie
            const response = await api
                .post(BASE_URL)
                .set("Cookie", `accessToken=${accessToken}`)
                .field("text", "hello")
                .field("postedBy", userId)
                .attach("file", `${__dirname}/../test-data/test-pic.png`);

            expect(response.body.text).toBe("hello");
            expect(response.body.postedBy).toBe(userId);

            const savedUser = await getPostById(response.body.id);

            expect(savedUser?.photo?.data).toBeInstanceOf(Buffer); // Verify that the file was uploaded
            expect(savedUser?.photo?.contentType).toBe("image/png");
        });
    });

    // describe("unhappy path", () => {
    it("should return 401 if accessToken is not provided as cookie in request", async () => {
        const userId = "1";
        const BASE_URL = getBaseUrl(userId);

        await api.post(BASE_URL).send({}).expect(401);
    });
    it("should return 400 if title is not provided as validation error", async () => {
        const user = await createUser(userData);

        const accessToken = await createAccessToken(user);

        const userId = user._id.toString();
        const BASE_URL = getBaseUrl(userId);

        //add cookie
        await api
            .post(BASE_URL)
            .send({
                postedBy: userId,
            })
            .set("Cookie", `accessToken=${accessToken}`)
            .expect(400);
    });

    it("should return 400 if postedBy is not provided as validation error", async () => {
        const user = await createUser(userData);

        const accessToken = await createAccessToken(user);

        const userId = user._id.toString();
        const BASE_URL = getBaseUrl(userId);

        //add cookie
        await api
            .post(BASE_URL)
            .send({
                text: "test",
            })
            .set("Cookie", `accessToken=${accessToken}`)
            .expect(400);
    });
    it("should return 400 if userId is of invalid type", async () => {
        const user = await createUser(userData);
        const accessToken = await createAccessToken(user);
        const userId = user._id.toString();
        const BASE_URL = getBaseUrl("1234567890");

        //add cookie
        await api
            .post(BASE_URL)
            .send({
                text: "test",
                postedBy: userId,
            })
            .set("Cookie", `accessToken=${accessToken}`)
            .expect(400);
    });
    it("should return 401 if url userId is not same as auth userId", async () => {
        const user = await createUser(userData);
        const accessToken = await createAccessToken(user);

        const userId = DELETED_USER_ID;
        const BASE_URL = getBaseUrl(userId);

        //add cookie
        await api
            .post(BASE_URL)
            .send({
                text: "test",
                postedBy: userId,
            })
            .set("Cookie", `accessToken=${accessToken}`)
            .expect(401);
    });
    // });
});

export const getBaseUrl = (userId: string) => {
    const BASE_URL = `/users/${userId}/posts`;
    return BASE_URL;
};
