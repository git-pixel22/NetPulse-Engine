import mongoose, {isValidObjectId} from "mongoose"
import {Comment} from "../models/comment.model.js"
import {Video} from "../models/video.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if(!videoId.trim() || !isValidObjectId(videoId)) {
        throw new ApiError(404, "Video Does Not Exist!")
    }

    const { page = 1, limit = 10 } = req.query;

    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        sort: { createdAt: -1 } // Sort by newest comments first
    };

    try {
        const aggregationPipeline = [
            {
                $match: {
                    video: new mongoose.Types.ObjectId(videoId)
                }
            },
            {
                $sort: options.sort
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'owner',
                    foreignField: '_id',
                    as: 'owner'
                }
            },
            {
                $unwind: {
                    path: "$owner",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    content: 1,
                    createdAt: 1,
                    owner: {
                        _id: 1,
                        username: 1,
                        avatar: 1
                    }
                }
            }
        ];

        const result = await Comment.aggregatePaginate(
            Comment.aggregate(aggregationPipeline),
            options
        );

        res.json({
            comments: result.docs,
            totalPages: result.totalPages,
            currentPage: result.page,
            totalComments: result.totalDocs
        });
    } catch (error) {
        throw new ApiError(500, "Server Error");
    }
});



const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const {videoId} = req.params;

    if(!videoId.trim() || !isValidObjectId(videoId)) {
        throw new ApiError(404, "Video Does Not Exist!")
    }

    const owner = req.user;
    const {commentContent} = req.body;

    if(!owner) {
        throw new ApiError(401, "Invalid Access, You Might Need To Login In Again")
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

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const {commentId} = req.params;

    if (!commentId.trim() || !isValidObjectId(commentId)) {
        throw new ApiError(400, "Comment Does Not Exist")        
    }

    const commentDeleted = await Comment.findByIdAndDelete(commentId);

    if(!commentDeleted) {
        throw new ApiError(500, "Some error occurred while deleting the comment.")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, commentDeleted, "Comment Deleted Successfully")
    )
})

export {
    getVideoComments, 
    addComment,
    deleteComment
}