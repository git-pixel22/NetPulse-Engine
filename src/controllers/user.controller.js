import asyncHandler from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"

const registerUser = asyncHandler( async (req, res) => {

    // get user details from frontend
    const {fullName, email, username, password } = req.body;

    // validation - not empty
    const fields = { fullName, email, username, password };
    const errors = []; // contains the errors about missing fields

    // validation - not empty
    for (const [key, value] of Object.entries(fields)) {
        if (!value) {
            errors.push(`${key} is required`);
        }
    }

    if (errors.length > 0) {
        throw new ApiError("400", errors.join(', '));
    }

    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinary, check avatar again
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // returen response

    console.log("email: ", email);
    console.log("password: ", password);
})

export {registerUser}