import asyncHandler from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"

const registerUser = asyncHandler( async (req, res) => {

    // Get User Details From Frontend/Postman/CLI

    const {fullName, email, username, password } = req.body;

    // Validation Of User Fields - Check If Empty

    const fields = { fullName, email, username, password };
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
        throw new ApiError(409,"User already exists")
    }

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