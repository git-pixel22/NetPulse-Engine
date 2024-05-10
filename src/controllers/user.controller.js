import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import fs from 'fs';
import jwt from "jsonwebtoken"


const generateAccessAndRefreshToken = async (userId) => {

    try {
        const user = await User.findById(userId);
        
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();


        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false })

        return {accessToken, refreshToken};

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating Access and Refresh Token");
    }
}

const registerUser = asyncHandler( async (req, res) => {

    // Get User Details From Frontend/Postman/CLI

    const {fullName, email, username, password } = req.body;
    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

    // Validation Of User Fields - Check If Empty

    const fields = { username, email, fullName, password };
    const errors = []; // an array that contains the errors about missing fields. For example - "fullName is required", if fullName is missing

    for (const [key, value] of Object.entries(fields)) {
        if (!value) {
            errors.push(`${key} is required`);
        }
    }

    if (errors.length > 0) {
        throw new ApiError("400", errors.join(', '));
    }

    // Check If User Already Exists: Checking Username/Email
    
    const userExists = await User.findOne({
        $or: [{username}, {email}]
    })

    if(userExists){
        
        // Remove uploaded files if user already exists
        if (avatarLocalPath) {
            fs.unlinkSync(avatarLocalPath);
        }
        if (coverImageLocalPath) {
            fs.unlinkSync(coverImageLocalPath);
        }

        throw new ApiError(409,"User already exists")
}

    // Check If The Image Exists In The Local Path
    
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar File Is Required")
    }

    // Upload Images To Cloudinary, Check Avatar Again (Avatar Is A Required Field Remember)

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new ApiError(500, "Something went wrong while uploading Avatar file. Please try again.")
    }

    // Create User object - Create Entry In DB

    const user = await User.create({
        username: username.toLowerCase(),
        email,
        fullName,
        password,
        avatar: avatar.url,
        coverImage: coverImage?.url || ""
    })
    
    // Remove Password And Refresh Token Field From Response

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    // Check For User Creation

    if (!createdUser) {
        throw new ApiError(500, "Somethhing went wrong while user registration")
    }

    // Return Response

    return res.status(200).json(
        new ApiResponse(200, createdUser, "User Registered Successfully")
    )
})

const loginUser = asyncHandler( async (req, res) => {

    // Get User Details From Frontend/Postman/CLI

    const {username, email, password} = req.body;

    
    // Validation Of User Fields - Check If Empty

    if(!username && !email) { 
        throw new ApiResponse(400, "Missing Username or Email");
    }

    if(!password) {
        throw new ApiResponse(400, "Missing Passsword");
    }

    
    // Check If User Exists

    const user = await User.findOne({
        $or: [{username}, {email}]
    })

    if(!user) {
        throw new ApiResponse(404, "Invalid Username or Email")
    }

    // Check If The Password Is Correct
    
    const isPasswordCorrect = await user.isPasswordCorrect(password);

    if(!isPasswordCorrect) {
        throw new ApiResponse(401, "Incorrect Credentials")
    }

    // Generate Access and Refresh Token

    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id);

    // Set Tokens As Cookie And Return Response 

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httopOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User Logged In!"
        )
    )

})

const logoutUser = asyncHandler( async (req, res) => {
    // Purge User's Access and Refresh Token Both From Browser And DB

    //req.user comes from the auth middleware
    const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: ""
            }
        },
        {
            new: true
        }
    );
    
    if (!updatedUser) {
        throw new ApiError(500, "Failed to update refreshToken for the user");
    }

    const options = {
        httopOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(
        new ApiResponse(200, {}, "User Logged Out!")
    )

})

const refreshAccessToken = asyncHandler( async (req, res) => {

    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken


    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized Request")
    }

    const decodedToken = jwt.verify(
        incomingRefreshToken,
        process.env.REFRESH_TOKEN_SECRET,
    )

    const user = User.findById(decodedToken._id)

    if (!user) {
        throw new ApiError(401, "Refresh Token Is Invalid")
    }

    if (incomingRefreshToken !== user.refreshToken){
        throw new ApiError(401, "Refresh Token Is Expired or Used")
    }

    const {accessToken, newRefreshToken} = await generateAccessAndRefreshToken(user._id);

    const options = {
        httopOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", newRefreshToken, options)
    .json(
        new ApiResponse(
            200,
            {
                accessToken, refreshToken: newRefreshToken
            },
            "Access Token Refreshed!"
        )
    )
    
})

const changePassword = asyncHandler( async (req, res) => {

    const {oldPassword, newPassword} = req.body;

    const user = await User.findById(req.user?._id);

    if(!user){
        throw new ApiError(404, "User does not exist")
    }

    const passwordCheckResult = await user.isPasswordCorrect(oldPassword);

    if(!passwordCheckResult){
        throw new ApiError(400, "Invalid Password")
    }

    user.password = newPassword;

    // We have a .pre() method in our model, that encrypts the password before the user is saved.
    await user.save({validateBeforeSave: false})

    // const updatedUserPassword = await User.findByIdAndUpdate(
    //     user._id,
    //     {
    //         $set: {
    //             password: newPassword
    //         }
    //     }
    // );

    return res
    .status(200)
    .json(
        new ApiResponse(200, {}, "Password Changed Successfully!")
    )   
})

const getCurrentUser = asyncHandler( async (req, res) => {
    
    // const user = req.user;

    return res
    .status(200)
    .json(
        new ApiResponse(200, req.user, "Current User Fetched Successfully!")
    )
})

const updateAccountDetails = asyncHandler( async (req, res) => {

    const {fullName, email} = req.body;
    
    if(!fullName || !email){
        throw new ApiError(400, "All Fields Are Required")
    }

    // Here we're not using .save() as in changePassword controller, since we don't have the need to use .pre() hook defined in user model. The .pre() hook is mainly used in our code to hash the updated password before it is saved.
    const updatedUser = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName,
                email
            }
        },
        {
            new: true // returns the new information/object after update
        }
    ).select("-password")

    return res
    .status(200)
    .json(
        new ApiResponse(200, updatedUser, "User Details Updated!")
    )    

})

const updateAvatar = asyncHandler( async (req, res) => {

    const avatarLocalPath = req.file?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar File Is Missing")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);

    if (!avatar.url) {
        throw new ApiError(400, "Error While Uploading Avatar")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar: avatar.url
            }
        },
        {
            new: true
        }
    ).select("-password")

    return res
    .status(200)
    .json(
        new ApiResponse(200, user, "Avatar Image Updated Successfully!")
    )
})

const updateCoverImage = asyncHandler( async (req, res) => {

    const coverImageLocalPath = req.file?.path;

    if (!coverImageLocalPath) {
        throw new ApiError(400, "Cover Image File Is Missing")
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if (!coverImage.url) {
        throw new ApiError(400, "Error While Uploading Cover Image")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                coverImage: coverImage.url
            }
        },
        {
            new: true
        }
    ).select("-password")

    return res
    .status(200)
    .json(
        new ApiResponse(200, user, "Cover Image Updated Successfully!")
    )
})


export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changePassword,
    getCurrentUser,
    updateAccountDetails,
    updateAvatar,
    updateCoverImage
}