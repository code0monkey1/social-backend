import { checkSchema } from "express-validator";

export const postValidator = checkSchema({
    postedBy: {
        errorMessage: "postedBy is missing",
        notEmpty: true,
        trim: true,
    },
    text: {
        errorMessage: "text is missing",
        notEmpty: true,
        trim: true,
    },
});
