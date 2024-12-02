import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import { validateMIMEType } from "validate-image-type";
import fs from "fs";
import logger from "../config/logger";

import { FileRequest, ValidationResult } from "./types";

export const parseImage = async (
    req: Request,
    _res: Response,
    next: NextFunction,
) => {
    try {
        const _req = req as FileRequest;

        if (!_req.file) {
            return next();
        }

        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        const result = (await validateMIMEType(_req.file.path, {
            allowMimeTypes: [
                "image/jpeg",
                "image/gif",
                "image/png",
                "image/svg+xml",
            ],
        })) as ValidationResult;

        //delete if picture is of incorrect format
        if (!result.ok) {
            fs.unlink(_req.file.path, (err) => {
                if (err instanceof Error) {
                    logger.error(err);
                    throw createHttpError(500, "Error while deleting file");
                }
            });

            throw createHttpError(400, "Invalid file type");
        }

        next();
    } catch (e) {
        next(e);
    }
};
