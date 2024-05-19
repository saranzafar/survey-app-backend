import mongoose, { Schema } from "mongoose";

const optionSchema = new Schema({
    optionText: {
        type: String,
        required: true
    },
});

const questionSchema = new Schema({
    question: {
        type: String,
        required: true
    },
    options: [optionSchema],
}, { timestamps: true });


export const Question = mongoose.model("Question", questionSchema)