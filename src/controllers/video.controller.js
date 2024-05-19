import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query='', sortBy='createdAt', sortType, userId } = req.query
    // TODO: get all videos based on query, sort, pagination
    // select published videos
    // query parameter will be looked into title or description
    // sortBy will have 3 options - createdAt, views, duration
    // sortType will have 2 options - ascending or descending

    if (!query.trim()) {
        throw new ApiError(400, "Missing search query");
    }

    if (sortType !== "asc" && sortType !== "desc") {
        throw new ApiError(400, "Invalid sorting options: Must be 'asc' or 'desc'");
    }

    const allowedSortFields = ['createdAt', 'views', 'duration'];
    if (!allowedSortFields.includes(sortBy)) {
        throw new ApiError(400, `Invalid sorting field: Must be one of ${allowedSortFields.join(', ')}`);
    }

    // Define the sort object based on sortBy and sortType
    const sortObj = { [sortBy]: sortType === 'asc' ? 1 : -1 };

    // Construct the aggregation pipeline
    const pipeline = [
        {
        $match: {
            $or: [
            { title: { $regex: query, $options: "i" } },
            { description: { $regex: query, $options: "i" } }
            ],
            isPublished: true
        }
        },
        { $sort: sortObj }
    ];

    // Options for pagination
    const options = {
        page: parseInt(page),
        limit: parseInt(limit)
    };

    // Execute the aggregation pipeline with pagination
    const result = await Video.aggregatePaginate(Video.aggregate(pipeline), options);

    return res
    .status(200)
    .json(
        new ApiResponse(200, result, "Videos Fetched Successfully!")
    )

})

const publishAVideo = asyncHandler(async (req, res) => {

    console.log("Entered publish a vide0");

    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video
    const videoFilePath = req.files?.videoFile?.[0].path;
    const thumbnailPath = req.files?.thumbnail?.[0].path;

    // Validation Of Video Fields - Check If Empty

    const fields = { title, description};
    const errors = []; // an array that contains the errors about missing fields. For example - "title is required", if title is missing

    for (const [key, value] of Object.entries(fields)) {
        if (!value) {
            errors.push(`${key} is required`);
        }
    }

    if (errors.length > 0) {
        throw new ApiError("400", errors.join(', '));
    }

    if(!videoFilePath) {
        throw new ApiError(400, "Video File Is Required");
    }

    if(!thumbnailPath) {
        throw new ApiError(400, "Thumbnail File Is Required");
    }

    const videoFile = await uploadOnCloudinary(videoFilePath);
    const thumbnail = await uploadOnCloudinary(thumbnailPath);

    if(!videoFile) {
        throw new ApiError(500, "Something went wrong while uploading video file. Please try again.")
    }

    if(!thumbnail) {
        throw new ApiError(500, "Something went wrong while uploading thumbnail file. Please try again.")
    }

    // Create Video object - Create Entry In DB

    const video = await Video.create({
        videoFile: videoFile.url,
        thumbnail: thumbnail.url,
        title,
        description,
        duration: videoFile.duration,
        isPublished: true,
        owner: req.user_id
    })

    if (!video) {
        throw new ApiError(500, "Something went wrong while publishing the video")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, video, "Video Published Successfully!")
    )

})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
    // watch history logic
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}