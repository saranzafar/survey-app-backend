import { AsyncHandler } from "../utils/AsyncHandler.js";
import { Question } from "../models/questions.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";

const addQuestion = AsyncHandler(async (req, res) => {
    /*
    - take data
    - add to database
    */
    const { question, options, feedBack } = req.body

    if (!question || !options || options.length < 2) {
        throw new ApiError(400, "Question and Options must be provided")
    }

    // adding to DB
    let newQuestion;
    try {
        newQuestion = await Question.create({
            question,
            options,
            feedBack
        });
    } catch (error) {
        throw new ApiError(500, "Error while adding new data")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, newQuestion, "Data Added Successfully")
        )
});

const getQuestion = AsyncHandler(async (req, res) => {
    const response = await Question.find()
    if (!response.length) {
        return res.status(404).json(new ApiResponse(404, null, 'No Question found'));
    }
    return res.status(200).json(new ApiResponse(200, response, 'Question(s) fetched successfully'));
});

const deleteQuestion = AsyncHandler(async (req, res) => {
    const { questionId } = req.params;
    if (!questionId?.trim()) {
        throw new ApiError(400, "Question ID not provided");
    }

    let deletedQuestionResponse;
    try {
        deletedQuestionResponse = await Question.deleteOne({ _id: questionId });
        if (deletedQuestionResponse.deletedCount === 0) {
            throw new ApiError(404, "Question not found");
        }
        return res.status(200).json({ message: "Question deleted successfully" });
    } catch (error) {
        if (error instanceof ApiError) {
            throw new ApiError(502, "Error While Deleting Question");
        } else {
            throw new ApiError(501, "Error while deleting data from DB");
        }
    }
});

const updateAdminInfo = AsyncHandler(async (req, res) => {
    const { name, email } = req.body;

    if (!(name || email)) {
        throw new ApiError(400, "Please provide Data");
    }

    const user = await User.findOneAndUpdate(
        req.user?._id,
        {
            $set:
            {
                name,
                email,
                role: true
            }
        },
        { new: true },
    ).select("-password -_id -role -createdAt -refreshToken")

    return res.status(200)
        .json(new ApiResponse(200, user, "Account Details Updated Successfully"))
})

export {
    addQuestion,
    getQuestion,
    deleteQuestion,
    updateAdminInfo,
}