import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    
    const {videoId} = req.params;
    const userId = req.user._id;

    if(videoId.trim() || !isValidObjectId(videoId)) {
        throw new ApiError("400", "Video Does Not Exist")
    }
    
    // Check if the video is already liked

    const likedVideo = await Like.findOne({
        video: videoId,
        likedBy: userId
    })

    let likeStatus;

    if(likedVideo) {
        // Remove like from Video
        await Like.findByIdAndDelete(likedVideo._id);
        likeStatus = "Unliked";
    } else {
        // Add like to video
        await Like.create({
            video: videoId,
            likedBy: userId
        });
        likeStatus = "Liked";
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, likeStatus, "Video's Like Status Toggled Successfully")
    )

})

const toggleCommentLike = asyncHandler(async (req, res) => {
    
    const {commentId} = req.params
    const userId = req.user._id;

    if(commentId.trim() || !isValidObjectId(commentId)) {
        throw new ApiError("400", "Comment Does Not Exist")
    }
    
    // Check if the video is already liked

    const likedComment = await Like.findOne({
        comment: commentId,
        likedBy: userId
    })

    let likeStatus;

    if(likedComment) {
        // Remove like from Video
        await Like.findByIdAndDelete(likedComment._id);
        likeStatus = "Unliked";
    } else {
        // Add like to video
        await Like.create({
            comment: commentId,
            likedBy: userId
        });
        likeStatus = "Liked";
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, likeStatus, "Comment's Like Status Toggled Successfully")
    )

})

const toggleTweetLike = asyncHandler(async (req, res) => { 

    const {tweetId} = req.params
    const userId = req.user._id;

    if(!tweetId.trim() || !isValidObjectId(tweetId)) {
        throw new ApiError("400", "Tweet Does Not Exist")
    }
    
    // Check if the video is already liked

    const likedComment = await Like.findOne({
        tweet: tweetId,
        likedBy: userId
    })

    let likeStatus;

    if(likedTweet) {
        // Remove like from Video
        await Like.findByIdAndDelete(likedTweet._id);
        likeStatus = "Unliked";
    } else {
        // Add like to video
        await Like.create({
            tweet: tweetId,
            likedBy: userId
        });
        likeStatus = "Liked";
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, likeStatus, "Tweet's Like Status Toggled Successfully")
    )

})



const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}