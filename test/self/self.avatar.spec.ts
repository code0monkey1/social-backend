import supertest from "supertest";
import app from "../../src/app";
import { createAccessToken, createUser } from "../auth/helper";
import { UserRepository } from "../../src/repositories/UserRepository";
import { db } from "../../src/utils/db";
import User, { PhotoType } from "../../src/models/user.model";
const api = supertest(app);
const BASE_URL = "/self/avatar";

describe("GET /self/avatar", () => {
    beforeAll(async () => {
        await db.connect();
    });

    afterEach(async () => {
        await User.deleteMany({});
    });

    afterAll(async () => {
        await db.disconnect();
    });
    describe("happy path", () => {
        // TODO: fix this test
        it.skip("should return avatar data as null ,if avatar not created ", async () => {
            const user = {
                name: "test",
                email: "test@gmail.com",
                password: "testfhsr",
            };

            const savedUser = await createUser(user);
            const accessToken = await createAccessToken(savedUser);

            // the content type should be image/png
            const response = await api
                .get(BASE_URL)
                .set("Cookie", [`accessToken=${accessToken}`])
                .expect("Content-Type", /json/)
                .expect(200);

            expect(response.body).toBeNull();
        });
        // TODO: fix this test
        it.skip("should return avatar data and content type if avatar is created ", async () => {
            const user = {
                name: "test",
                email: "test@gmail.com",
                password: "testfhsr",
            };

            const savedUser = await createUser(user);
            const accessToken = await createAccessToken(savedUser);

            //update avatar data
            const avatar = {
                data: Buffer.from("../users/test-data/test-pic.png", "base64"),
                contentType: "image/png",
            } as PhotoType;

            await User.findByIdAndUpdate(savedUser._id, { avatar });

            // the content type should be image/png
            const response = await api
                .get(BASE_URL)
                .set("Cookie", [`accessToken=${accessToken}`])
                .expect("Content-Type", `image/png; charset=utf-8`)
                .expect(200);

            expect(response.body).toBeInstanceOf(Buffer);
        });
    });

    describe("unhappy path", () => {
        it("should return 401 if no accessToken is provided", async () => {
            await api.get(BASE_URL).expect(401);
        });

        it("should return 404 if user does not exist", async () => {
            const user = {
                name: "test",
                email: "test@gmail.com",
                password: "testfhsr",
            };

            const savedUser = await createUser(user);
            const accessToken = await createAccessToken(savedUser);

            const userRepository = new UserRepository();
            await userRepository.deleteById(savedUser._id.toString());

            await api
                .get(BASE_URL)
                .set("Cookie", [`accessToken=${accessToken}`])
                .expect(404);
        });
    });
});
