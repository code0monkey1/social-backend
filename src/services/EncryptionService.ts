import { HashComparer } from "../interfaces/cryptography/HashComparer";
import { HashGenerator } from "../interfaces/cryptography/HashGenerator";
import bcrypt from "bcrypt";

export class EncryptionService implements HashGenerator, HashComparer {
    constructor(private readonly salt = 10) {}

    async hash(value: string): Promise<string> {
        return bcrypt.hash(value, this.salt);
    }

    async compare(plaintext: string, hash: string): Promise<boolean> {
        return bcrypt.compare(plaintext, hash);
    }
}
