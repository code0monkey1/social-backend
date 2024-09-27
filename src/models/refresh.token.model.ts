import { Schema, model } from "mongoose";

export interface RefreshTokenType {
    user: string;
    expiresAt: Date;
    isGuest: boolean;
}

const RefreshTokenSchema = new Schema(
    {
        user: { type: Schema.Types.ObjectId, ref: "User", required: true },
        expiresAt: { type: Date, required: true },
        isGuest: { type: Boolean, default: false }, // New field to indicate if the user is a guest
    },
    { timestamps: true },
);

RefreshTokenSchema.index(
    { createdAt: 1 },
    {
        expireAfterSeconds: 60 * 60 * 24, // expires in a day
        partialFilterExpression: { isGuest: true },
    },
);

const RefreshToken = model("RefreshToken", RefreshTokenSchema);

export default RefreshToken;
