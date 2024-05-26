import { PostType } from "../models/post.model";
import { Request } from "express";
export type AuthCookie = {
    accessToken: string;
    refreshToken: string;
};

export type RefreshTokenPayload = {
    refreshTokenId: string;
    userId: string;
};

export interface PostRequest extends Request {
    post: PostType;
}
