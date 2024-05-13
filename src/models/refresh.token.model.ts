import { Schema, model } from "mongoose";

export interface RefreshTokenType {
    user: string;
    expiresAt: Date;
}

const RefreshTokenSchema = new Schema(
    {
        user: { type: Schema.Types.ObjectId, ref: "User", required: true },
        expiresAt: { type: Date, required: true },
    },
    { timestamps: true },
);

const RefreshToken = model("RefreshToken", RefreshTokenSchema);

export default RefreshToken;
