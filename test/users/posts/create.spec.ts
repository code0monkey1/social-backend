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
import Post from "../../../src/models/post.model";

const api = supertest(app);
const BASE_URL = "/posts";

describe("POST /posts", () => {
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

    describe("unhappy path", () => {
        it("should return 401 if accessToken is not provided as cookie in request", async () => {
            await api.post(BASE_URL).send({}).expect(401);
        });
        it("should return 400 if title is not provided as validation error", async () => {
            const user = await createUser(userData);

            const accessToken = await createAccessToken(user);

            const userId = user._id.toString();

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

            //add cookie
            await api
                .post(BASE_URL)
                .send({
                    text: "test",
                })
                .set("Cookie", `accessToken=${accessToken}`)
                .expect(400);
        });

        //DONE:'should return 400 "Invalid file type" when file uploaded for post is not a photo'
        it('should return 400 "Invalid file type" when file uploaded for post is not a photo', async () => {
            const user = await createUser(userData);

            const accessToken = await createAccessToken(user);

            const result = await api
                .post(`${BASE_URL}`)
                .set("Cookie", [`accessToken=${accessToken}`])
                .attach("file", `${__dirname}/../test-data/fake-text-pic.png`)
                .expect(400);

            expect(result.body.errors[0].message).toBe("Invalid file type");
        }, 100000);

        it("should return status 413 , if file size is greater than 16mb", async () => {
            const user = await createUser(userData);
            const accessToken = await createAccessToken(user);
            const userId = user._id.toString();

            // set access token as cookie
            const response = await api
                .post(BASE_URL)
                .set("Cookie", `accessToken=${accessToken}`)
                .field("text", "hello")
                .field("postedBy", userId)
                .attach("file", `${__dirname}/../test-data/image-20mb.jpeg`)
                .expect(413);

            expect(response.body.errors[0].message).toBe("File too large");

            const posts = await Post.find({});

            expect(posts.length).toBe(0);
        });
    });
});
