import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const owner = req.user;
    const {content} = req.body;

    if (!content || !content.trim()) {
        throw new ApiError(400, "Tweet has no content")
    }

    const tweet = await Tweet.create({
            owner,
            content
        }
    )

    if(!tweet) {
        throw new ApiError(500, "Some error occured while creating Tweet.")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, tweet, "Tweet Created Successfully")
    )
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const {userId} = req.params;

    if(!userId|| !userId.trim() || !isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid User ID");
    }

    const page = 1, limit = 10;

    const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sort: {createdAt: -1}
    }

    try {
        const aggregationPipeline = [
            {
                $match: {
                    owner: new mongoose.Types.ObjectId(userId)
                }
            },
            {
                $sort: options.sort
            }
        ];

        const result = await Tweet.aggregatePaginate(
            Tweet.aggregate(aggregationPipeline), 
            options
        );

        return res
        .status(200)
        .json(
            new ApiResponse(200, result, "Tweets Fetched Successfully")
        );
    } catch (error) {
        throw new ApiError(500, "Server Error");
    }

})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const {tweetId} = req.params;

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid Tweet ID")
    }

    const deletedTweet = await Tweet.findByIdAndDelete(tweetId);

    if(!deletedTweet) {
        throw new ApiError(500, "Unable To Delete Tweet")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, deletedTweet, "Tweet Deleted Successfully")
    )
})

export {
    createTweet,
    getUserTweets,
    deleteTweet
}