import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { AsyncHandler } from '../utils/AsyncHandler.js';
import { Answer } from "../models/response.model.js"
import { User } from "../models/user.model.js"

const setResponse = AsyncHandler(async (req, res) => {
    // try {
    const { surveyData } = req.body;
    const userId = req.user._id;

    // Check if surveyData exists and is not empty
    if (!surveyData || surveyData.length === 0) {
        throw new ApiError(400, "Please provide survey data");
    }

    // Fetch user from DB
    const userInfo = await User.findById(userId)
        .select("-password -createdAt -updatedAt -refreshToken -role -name");
    if (!userInfo) {
        throw new ApiError(400, 'User not found');
    }

    // Check if the user has already submitted the form
    // const existingResponse = await Answer.findOne()
    // if (existingResponse) {
    //     return res.status(200).json(
    //         new ApiResponse(403, {}, "You Have Already Submitted the Form")
    //     );
    // }

    // Save survey data along with user information
    await Answer.create({
        user: userInfo,
        question: surveyData
    });

    return res.status(201).json(
        new ApiResponse(200, {}, "Survey response added successfully")
    );
    // } catch (error) {
    //     console.error(error);
    //     throw new ApiError(500, 'Error while saving survey response to database');
    // }
});

const getResponse = AsyncHandler(async (req, res) => {
    // try {
    // Fetch all responses from the database
    const responses = await Answer.find()

    // Check if there are any responses
    if (!responses.length) {
        return res.status(404).json(new ApiResponse(404, null, 'No responses found'));
    }

    // Return the responses
    return res.status(200).json(new ApiResponse(200, responses, 'Responses fetched successfully'));
    // }
});



export {
    setResponse,
    getResponse,
}
