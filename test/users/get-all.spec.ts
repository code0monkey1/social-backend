import supertest from "supertest";
import app from "../../src/app";
import { db } from "../../src/utils/db";
import jwt from "jsonwebtoken";
import User, { UserType } from "../../src/models/user.model";
import { UserRepository } from "../../src/repositories/UserRepository";
import { hash } from "bcrypt";
const api = supertest(app);
const BASE_URL = "/users";
let accessToken: string;
let userRepository: UserRepository;
describe("GET /users", () => {
    beforeAll(async () => {
        await db.connect();

        accessToken =
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NjNmMGY1Mzc5YWIxMDBjZGQ1Nzg4MmUiLCJpYXQiOjE3MTU0MDg3MjN9.LvqCZLdhkKL9DqYFXZbJZlF9BWKMQ_MBIn7D3DM-Wt4";

        userRepository = new UserRepository();
    });

    afterAll(async () => {
        await db.disconnect();
    });

    afterEach(async () => {
        await User.deleteMany({});
    });

    describe("happy path", () => {
        it("should return json response", async () => {
            await api.get(BASE_URL).expect("Content-Type", /json/);
        });

        it("should return a list of users", async () => {
            // insert single user

            //arrange
            const user = {
                name: "test",
                email: "test@gmail.com",
                password: "testing_right",
            };
            //act

            await createUser(user);

            //assert
            const users = await api
                .get(BASE_URL)
                .set("Cookie", [`accessToken=${accessToken}`])
                .expect(200);

            expect(users.body.length).toBe(1);

            expect(users.body[0].name).toBe(user.name);
        });
    });

    describe("unhappy path", () => {
        it("should return 401 when auth not provided", async () => {
            await api.get(BASE_URL).expect(401);
        });
    });
});

async function createUser(user: any) {
    return userRepository.create({
        ...user,
        hashedPassword: await hash(user.password, 10),
    });
}
