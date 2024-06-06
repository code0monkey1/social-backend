import bcrypt from "bcrypt";
import supertest from "supertest";
import app from "../../src/app";
import { db } from "../../src/utils/db";
import { IndexDefinition } from "mongoose";
import { userData, getUserById, createUser } from "../testHelpers";
import User from "../../src/models/user.model";
const api = supertest(app);
const BASE_URL = "/auth/register/guest";

describe("POST /auth/register/guest", () => {
    beforeAll(async () => {
        await db.connect();
    });

    beforeEach(async () => {
        // delete all users created
        await db.clear();
    });
    afterAll(async () => {
        // disconnect db
        await db.disconnect();
    });

    it("should register a new user with name same as password , and email to be name@guest_email.com", async () => {
        const response = await api.post(BASE_URL).send({}).expect(201);

        const user = await getUserById(response.body);

        expect(user.role).toBe("guest");

        // the name is the password
        expect(bcrypt.compare(userData.name, user.hashedPassword)).toBeTruthy();

        expect(user.email).toBe(`${user.name}@guest_email.com`);
    });

    it("should have expireAfterSeconds set to one day for guest user", async () => {
        const EXPIRE_IN_A_SECOND = 1;
        // Create the index
        await User.collection.createIndex(
            { createdAt: 1 },
            {
                expireAfterSeconds: EXPIRE_IN_A_SECOND,
                partialFilterExpression: { role: "guest" },
            },
        );

        // Find the index with the desired name
        const createdAtIndex = (
            await User.collection.listIndexes().toArray()
        ).find(
            (index: IndexDefinition) =>
                typeof index.key === "object" &&
                "createdAt" in index.key &&
                (index.key as { createdAt: number }).createdAt === 1,
        ) as IndexDefinition | undefined;

        // Assert that the expireAfterSeconds is set to one day
        expect(createdAtIndex?.expireAfterSeconds).toBe(EXPIRE_IN_A_SECOND);
    });
});
