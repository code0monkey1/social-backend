/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { PaginateModel, Schema, model, Document } from "mongoose";
import paginate from "mongoose-paginate-v2";
import { postOptions } from "../config/pagination";

export interface PhotoType {
    data: Buffer;
    contentType: string;
}

export interface CommentType {
    text: string;
    postedBy: string;
    createdAt: Date;
    _id: string;
}

export interface PostType extends Document {
    _id: string;
    postedBy: string;
    text: string;
    photo?: PhotoType;
    likes: Schema.Types.ObjectId[];
    comments: CommentType[];
}

const PostSchema = new Schema<PostType>(
    {
        postedBy: {
            type: String,
            ref: "User",
            required: [true, "Poster is required"],
        },
        text: {
            type: String,
            trim: true,
            required: [true, "Text is required"],
        },
        comments: [
            {
                text: {
                    type: String,
                    trim: true,
                    required: [true, "Comment is required"],
                },
                postedBy: {
                    type: Schema.Types.ObjectId,
                    ref: "User",
                },
                createdAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
        likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
        photo: {
            data: Buffer,
            contentType: String,
        },
    },
    {
        timestamps: true,
    },
);

// paginate with this plugin
PostSchema.plugin(paginate);

// delete the __v and the _id fields from the response object
PostSchema.set("toJSON", {
    versionKey: false,
    transform: function (doc, ret) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
    },
});

const Post = model<PostType, PaginateModel<PostType>>(
    "Post",
    PostSchema,
    "post",
);

void Post.paginate({}, postOptions);

export default Post;
