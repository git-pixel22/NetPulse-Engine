import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    const userId = req.user?._id;

    if (!userId || !isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid User ID");
    }

    try {
        const stats = {};

        // Fetch video statistics
        const videoStats = await Video.aggregate([
            {
                $match: { owner: new mongoose.Types.ObjectId(userId) }
            },
            {
                $group: {
                    _id: null,
                    totalVideos: { $sum: 1 },
                    totalViews: { $sum: "$views" }
                }
            }
        ]);

        if (videoStats.length > 0) {
            stats.totalVideos = videoStats[0].totalVideos;
            stats.totalViews = videoStats[0].totalViews;
        } else {
            stats.totalVideos = 0;
            stats.totalViews = 0;
        }

        // Fetch total subscribers
        const subscriberStats = await Subscription.aggregate([
            {
                $match: { channel: new mongoose.Types.ObjectId(userId) }
            },
            {
                $count: "totalSubscribers"
            }
        ]);

        stats.totalSubscribers = subscriberStats.length > 0 ? subscriberStats[0].totalSubscribers : 0;

        // Fetch total likes
        const ownerVideos = await Video.find({ owner: userId }, '_id');
        
        const videoIds = ownerVideos.map(video => video._id);

        const likesStats = await Like.aggregate([
            {
                $match: { video: { $in: videoIds } }
            },
            {
                $group: {
                    _id: null,
                    totalLikes: { $sum: 1 }
                }
            }
        ]);

        stats.totalLikes = likesStats.length > 0 ? likesStats[0].totalLikes : 0;

        // Log the stats
        // console.log("Channel Stats = ", stats);

        // Return the stats in response
        return res.status(200).json(new ApiResponse(200, stats, "Channel Stats Fetched"));

    } catch (error) {
        console.error("Error fetching channel stats:", error);
        throw new ApiError(500, "Internal Server Error");
    }
});

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel

    const userId = req.user?._id

    if(!userId || !isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid Playlist");
    }

    const videos = await Video.find({owner: userId})

    if(!videos) {
        throw new ApiError(500, "Unable To Fetch Videos");
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, videos, "Fetched All Videos Of The Channel")
    )

})

export {
    getChannelStats, 
    getChannelVideos
}