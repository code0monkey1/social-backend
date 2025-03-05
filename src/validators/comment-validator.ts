import { checkSchema } from "express-validator";

export const commentValidator = checkSchema({
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
