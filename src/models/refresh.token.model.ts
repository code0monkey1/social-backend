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
    // New field to indicate if the user is a guest, so that we can delete it later
    isGuest: { type: Boolean, default: false },
  },
  { timestamps: true },
);
/*
   A special refreshtokenschema collection index, 
   to delete guest user's refresh tokens so as to make 
   guest accounts inaccesible after 24 hours
 */
RefreshTokenSchema.index(
  { createdAt: 1 },
  {
    expireAfterSeconds: 60 * 60 * 24, // delete guest tokens after a day
    partialFilterExpression: { isGuest: true },
  },
);

const RefreshToken = model("RefreshToken", RefreshTokenSchema);

export default RefreshToken;
