import supertest from "supertest";
import app from "../../src/app";
import jwt from "jsonwebtoken";
import { UserRepository } from "../../src/repositories/UserRepository";
import { Config } from "../../src/config";
import { hash } from "bcrypt";
import { db } from "../../src/utils/db";
import User from "../../src/models/user.model";
import RefreshToken from "../../src/models/refresh.token.model";
const api = supertest(app);
const BASE_URL = "/auth/self";

let userRepository: UserRepository;

describe("GET /auth/self", () => {
    beforeEach(async () => {
        // delete all users created
        await User.deleteMany({});
        await RefreshToken.deleteMany({});
    });
    beforeAll(async () => {
        userRepository = new UserRepository();
        await db.connect();
    });

    afterAll(async () => {
        await db.disconnect();
    });

    describe("happy path", () => {
        it("should return json response", async () => {
            await api.get(BASE_URL).expect("Content-Type", /json/);
        });
        it("should get the user by auth userId in the request", async () => {
            const user = {
                name: "test",
                email: "test@gmail.com",
                password: "testfhsr",
            };
            const savedUser = await createUser(user);
            const accessToken = await createAccessToken(savedUser);

            const response = await api
                .get(BASE_URL)
                .set("Cookie", [`accessToken=${accessToken}`])
                .expect(200);

            expect(response.body.name).toBe(user.name);
        });
    });

    describe("sad path", () => {
        it("should return 401 if no accessToken is provided", async () => {
            await api.get(BASE_URL).expect(401);
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
                .get(BASE_URL)
                .set("Cookie", [`accessToken=${accessToken}`])
                .expect(404);
        });
        it("should return 401 if accessToken is invalid", async () => {
            const accessToken = "kjkjskjdkfj";

            await api
                .get(BASE_URL)
                .set("Cookie", [`accessToken=${accessToken}`])
                .expect(401);
        });
    });
});

async function createUser(user: any) {
    return userRepository.create({
        ...user,
        hashedPassword: await hash(user.password, 10),
    });
}

async function createAccessToken(user: any) {
    return await jwt.sign(
        {
            userId: user._id.toString(),
        },
        Config.JWT_SECRET!,
        {
            expiresIn: "1h",
        },
    );
}
