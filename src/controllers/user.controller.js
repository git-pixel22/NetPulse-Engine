import asyncHandler from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"

const registerUser = asyncHandler( async (req, res) => {

    // get user details from frontend
    const {fullName, email, username, password } = req.body;

    // validation - not empty
    if(fullName === "" && email === "" && username === "" && password === "") {
        throw new ApiError("400", "All fields are required")
    }


    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinary, check avatar again
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // returen response

    // console.log("email: ", email);
    // console.log("password: ", password);
})

export {registerUser}