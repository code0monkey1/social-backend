/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Schema, model } from "mongoose";
export interface UserType {
    name: string;
    email: string;
    hashedPassword: string;
    about?: string;
    photo?: string;
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
            required: [true, "Password is required"],
        },
        photo: {
            data: Buffer,
            type: String,
        },
        about: {
            type: String,
            trim: true,
        },
    },
    {
        timestamps: true,
    },
);

// delete the __v and the _id fields from the response object
UserSchema.set("toJSON", {
    versionKey: false,
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
