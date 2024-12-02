import { Readable } from "stream";
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
export interface UploadedFile {
    /** Name of the form field associated with this file. */
    fieldname: string;
    /** Name of the file on the uploader's computer. */
    originalname: string;
    /** Encoding type of the file */
    encoding: string;
    /** Value of the `Content-Type` header for this file. */
    mimetype: string;
    /** Size of the file in bytes. */
    size: number;
    /** `DiskStorage` only: Directory to which this file has been uploaded. */
    destination: string;
    /** `DiskStorage` only: Name of this file within `destination`. */
    filename: string;
    /** `DiskStorage` only: Full path to the uploaded file. */
    path: string;
    /** A Buffer of the entire file */
    buffer: Buffer;

    stream: Readable;
}

export interface FileRequest extends Request {
    file: UploadedFile;
}
export interface ValidationResult {
    ok: boolean;
}
