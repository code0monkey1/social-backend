/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Schema, model } from "mongoose";

export interface PhotoType {
  data: Buffer;
  contentType: string;
}

export const enum UserRoles {
  USER = "user",
  GUEST = "guest",
}

export interface UserType {
  name: string;
  email: string;
  hashedPassword: string;
  role: UserRoles;
  about?: string;
  avatar?: PhotoType;
  followers?: string[];
  following?: string[];
}

const UserSchema = new Schema<UserType>(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "Name is required"],
    },
    email: {
      type: String,
      trim: true,
      unique: true,
      required: [true, "Email is required"],
    },
    hashedPassword: {
      type: String,
      required: [true, "hashedPassword is required"],
    },
    about: {
      type: String,
      trim: true,
      default: "",
    },
    avatar: {
      data: Buffer,
      contentType: String,
    },

    role: {
      type: String,
      default: UserRoles.USER,
    },

    followers: [{ type: Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  {
    timestamps: true,
    collection: "users",
  },
);

UserSchema.index(
  { createdAt: 1 },
  {
    // 1 day expiry time for users with roles 'Guest'
    expireAfterSeconds: 60 * 60 * 24,
    partialFilterExpression: { role: UserRoles.GUEST },
  },
);

// delete the __v and the _id fields from the response object
UserSchema.set("toJSON", {
  transform: function (doc, ret) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    delete ret.hashedPassword;
  },
});
const User = model<UserType>("User", UserSchema);

export default User;
