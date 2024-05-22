import { checkSchema } from "express-validator";

export const postUpdateValidator = checkSchema({
    text: {
        optional: true,
        errorMessage: "Invalid text",
        trim: true,
        isLength: {
            errorMessage: "Text should be at least 5 characters",
            options: { min: 5 },
        },
    },
    "photo.data": {
        optional: true,
        errorMessage: "Invalid photo data",
        isString: true,
    },
    "photo.contentType": {
        optional: true,
        errorMessage: "Invalid photo content type",
        isMimeType: true,
    },
});
