import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
    const userId = req.user?._id;

    console.log("User ID = ", userId)

    if(!userId || !userId.trim() || !isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid Playlist");
    }

    const stats = []

    const videostats = await Video.aggregate(
        [
            {
                $match: {
                    owner: mongoose.Types.ObjectId(userId)
                }   
            },
            {
                $group: {
                    _id: null,
                    totalVideos: { $sum: 1 },
                    totalViews: { $sum: views }
                }
            }
        ]
    )

    console.log("Video stats = ", videostats)

    stats.push(videostats);

    const totalSubscribers = await Subscription.aggregate[
        {
            $match: { 
                channel: mongoose.Types.ObjectId(userId)
            } 
        },
        {
            $count: "totalSubscribers"
        }
    ]

    stats.push(totalSubscribers);


    const ownerVideos = await Video.find({owner: userId});
    const totalLikes = 0;

    for(let i = 0; i < ownerVideos.length; i++) {
        
        let video = ownerVideos[i];

        let likesOfVideo = await Video.findById(video._id); // got all documents of this video in liked Schema

        if(!likesOfVideo) {
            likesOfVideo = []
        }

        totalLikes = totalLikes + likesOfVideo.length;
    }

    stats.push(totalLikes);

    return res
    .status
    .json(new ApiResponse(200, stats, "Channel Stats Fetched"))
})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel

    const userId = req.user?._id

    if(!userId || !userId.trim() || !isValidObjectId(userId)) {
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