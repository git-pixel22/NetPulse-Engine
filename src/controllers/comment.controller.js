import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {Video} from "../models/video.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

    if (!videoId.trim()) {
        throw new ApiError(400, "Video Does Not Exist");
    }

    const comments = Comment.aggregate(
        [
            {
                $lookup: {
                    from: "videos"
                }
            }
        ]
    )



})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const {videoId} = req.params;
    const owner = req.user;
    const {commentContent} = req.body;

    if(!owner) {
        throw new ApiError(401, "Invalid Access, You Might Need To Login In Again")
    }

    if(!videoId.trim()) {
        throw new ApiError(400, "Video Does Not Exist")
    }

    if(!commentContent.trim()) {
        throw new ApiError(400, "Invalid Comment")
    }

    const video = await Video.findById(videoId);

    const comment = await Comment.create({
        content: commentContent,
        video,
        owner
    })

    if(!comment) {
        throw new ApiError(500, "Something went wrong while adding the comment")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, comment, "Added Comment Successfully!")
    )
    
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }