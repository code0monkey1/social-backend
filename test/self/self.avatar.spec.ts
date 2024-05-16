import supertest from "supertest";
import app from "../../src/app";
import { createAccessToken, createUser } from "../auth/helper";
import { UserRepository } from "../../src/repositories/UserRepository";
import { db } from "../../src/utils/db";
import User, { PhotoType } from "../../src/models/user.model";
import getDefaultProfileImageAndType from "../../src/helpers";
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
        // DONE : fixed test
        it("should return default avatar and image type if avatar not present ", async () => {
            const user = {
                name: "test",
                email: "test@gmail.com",
                password: "testfhsr",
            };

            const savedUser = await createUser(user);
            const accessToken = await createAccessToken(savedUser);

            const { defaultImageBuffer, defaultImageType } =
                getDefaultProfileImageAndType();

            // the content type should be image/png
            const response = await api
                .get(BASE_URL)
                .set("Cookie", [`accessToken=${accessToken}`])
                .expect("Content-Type", `${defaultImageType}`)
                .expect(200);

            expect(Buffer.compare(response.body, defaultImageBuffer)).toBe(0);
        });

        // DONE: fix this test
        it("should return avatar and image type if avatar present", async () => {
            const user = {
                name: "test",
                email: "test@gmail.com",
                password: "testfhsr",
            };

            const savedUser = await createUser(user);
            const accessToken = await createAccessToken(savedUser);

            // the data should be of Buffer type from file
            const file = `${__dirname}/test-pic.png`;
            const avatar = {
                data: Buffer.from(file),
                contentType: "image/png",
            } as PhotoType;

            await User.findByIdAndUpdate(savedUser._id, { avatar });

            // the content type should be image/png
            const response = await api
                .get(BASE_URL)
                .set("Cookie", [`accessToken=${accessToken}`])
                .expect("Content-Type", "image/png; charset=utf-8")
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
