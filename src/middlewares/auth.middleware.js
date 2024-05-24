import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js";

// Verifies the legitimacy of a user via the access token provided in the request and attaches user data to the request object.
export const verifyJWT = asyncHandler( async(req, _res, next) => {

    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer", "");

    if (!token || !token.trim()) {
        throw new ApiError(401, "Unauthorized Request");
    }

    // Decodes the JWT token to retrieve the payload generated during token creation using jwt.sign(). If the token is invalid, jwt.verify() throws an error.
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decodedToken?._id).select("-password -refreshToken -watchHistory")


    // If no user is found with the decoded token's ID, it indicates an invalid access token.
    if (!user) {
        throw new ApiError(401, "Invalid Access Token")       
    }

    req.user = user;

    next();

})