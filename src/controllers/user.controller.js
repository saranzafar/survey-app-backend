import { AsyncHandler } from '../utils/AsyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { User } from '../models/user.model.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import jwt from "jsonwebtoken"

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = await user.generateAccessToken()
        const refreshToken = await user.generateRefreshToken()

        user.refreshToken = refreshToken
        user.save({ validateBeforeSave: false })
        return { accessToken, refreshToken }

    } catch (error) {
        throw new ApiError(502, "Error while generating tokens")
    }
}

const registerUser = AsyncHandler(async (req, res) => {
    //get the user details from frontend
    // validate
    // check if the user already exist - username, email
    // create user object - create entry in DB
    // remove password field from response
    // check for user creation
    // return response

    //post request using raw data + json formate in postman

    const { name, password, email, role } = req.body;

    // validation
    if (!name || !password || !email) {
        throw new ApiError(400, "Please provide all fields");
    }
    // if ([email, password, name].some(field => field?.trim() === "")) {
    //     throw new ApiError(400, "All fields are required")
    // }

    // check if the user already exists - username, email
    const existingUser = await User.findOne({ email }); // check it again
    if (existingUser) {
        throw new ApiError(409, "User with this email already exists");
    }

    // create user object - create entry in DB
    const user = await User.create({
        name,
        password,
        email,
        role
    });


    // remove password field from response
    const createdUser = await User.findById(user._id).select(
        "-password -_id -createdAt -updatedAt"
    );

    // check for user creation
    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user");
    }

    // return response
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User Registered Successfully")
    );
});

const loginUser = AsyncHandler(async (req, res) => {
    const { email, password } = req.body

    if (!(email || password)) {
        throw new ApiError(200, "Please enter your Email and Password!")
    }
    const user = await User.findOne({ email })
    if (!user) {
        throw new ApiError(200, "User does't exist")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)
    if (!isPasswordValid) {
        throw new ApiError(200, "Incorrect Password")
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id)
    const logedinUser = await User.findById(user._id).
        select("-password -_id -createdAt -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }
    return res
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .status(200)
        .json(
            new ApiResponse(
                200,
                {
                    user: logedinUser, accessToken, refreshToken
                },
                "User LoggedIn Successfully"
            )
        );

})

const logoutUser = AsyncHandler(async (req, res) => {
    // why we are not accessing cookies to access user?
    //due to reuse
    User.findByIdAndUpdate(
        req.user._id,
        {
            $set: { refreshToken: undefined }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "LogOut Successfully"))
})

//need to search for it to use
const refreshAccessToken = AsyncHandler(async (req, res) => {
    const incommingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!incommingRefreshToken) {
        throw new ApiError(401, "Unauthorized Access")
    }

    try {
        const decodedToken = jwt.verify(
            incommingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
        const user = await User.findById(decodedToken?._id)
        if (!user) {
            throw new ApiError(401, "Invalid Refresh Token")
        }

        if (incommingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh Token is Expired or used")
        }

        const options = {
            httpOnly: true,
            secure: true
        }
        const { accessToken, newRefreshToken } = await generateAccessAndRefreshTokens(user._id)

        return res.status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    { accessToken, refreshToken: newRefreshToken },
                    "Access Token Refreshed Successfully"
                )
            )
    } catch (error) {
        throw new ApiError(401, error?.messame || "Invalid Refresh Token")
    }
})


export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
};
