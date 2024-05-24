import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Like } from './../models/like.model.js';
import { Comment } from "../models/comment.model.js";
import { Tweet } from "../models/tweet.model.js";


const toggleLike = async (Model, resourceId, userId) => {

    if (!isValidObjectId(resourceId)) throw new ApiError(400, "Invalid Resource Id")
    if (!isValidObjectId(userId)) throw new ApiError(400, "Invalid  UserId")

    const resource = await Model.findById(resourceId);
    if (!resource) throw new ApiError(404, "No Resource Found");

    const resourceField = Model.modelName.toLowerCase();

    const isLiked = await Like.findOne({ [resourceField]: resourceId, likedBy: userId })

    var response;
    try {
        response = isLiked ?
            await Like.deleteOne({ [resourceField]: resourceId, likedBy: userId }) :
            await Like.create({ [resourceField]: resourceId, likedBy: userId })
    } catch (error) {
        console.error("toggleLike error ::", error);
        throw new ApiError(500, error?.message || "Internal server error in toggleLike")
    }

    const totalLikes = await Like.countDocuments({ [resourceField]: resourceId });

    return { response, isLiked, totalLikes };

}


const toggleVideoLike = asyncHandler(async (req, res) => {

    const { videoId } = req.params
    const { response, isLiked, totalLikes } = await toggleLike(Video, videoId, req.user?._id);    

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {response,totalLikes},
                isLiked === null ? "Liked Successfully" : "Removed Like Successfully"
            )
        )

});


const toggleCommentLike = asyncHandler(async (req, res) => {

    const { commentId } = req.params;
    const { response, isLiked, totalLikes } = await toggleLike(Comment, commentId, req.user?._id);

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {response,totalLikes},
                isLiked === null ? "Liked Successfully" : "Removed Like Successfully"
            )
        )

})


const toggleTweetLike = asyncHandler(async (req, res) => {

    const { tweetId } = req.params;
    const { response, isLiked, totalLikes } = await toggleLike(Tweet, tweetId, req.user?._id);

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {response,totalLikes},
                isLiked === null ? "Liked Successfully" : "Removed Like Successfully"
            )
        )
})


const getLikedVideos = asyncHandler(async (req, res) => {
    
    const userId = req.user._id;
    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid User")
    }
       
    try{
        // Find all likes by the user where the video field is not null
        const likedVideos = await Like.find({ 
            likedBy: userId, 
            video: { $ne: null } 
        }).populate('video');

        return res.status(200).json(
            new ApiResponse(200, likedVideos, "Liked Videos Fetched")
        );
    } catch (error) {
        throw new ApiError(500, "Unbale To Fetch Liked Videos")
    }
});


export {
    toggleVideoLike,
    toggleCommentLike,
    toggleTweetLike,
    getLikedVideos
}