import { checkSchema } from "express-validator";

export const postValidator = checkSchema({
  text: {
    errorMessage: "text is missing",
    notEmpty: true,
    trim: true,
  },
});
