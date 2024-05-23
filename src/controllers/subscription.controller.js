import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params;
    const subscriberId = req.user._id;
    // TODO: toggle subscription
    if(!channelId.trim() || !isValidObjectId(channelId)) {
        throw new ApiError(400, "Channel Does Not Exist")
    }


    // Check if the channel is already subscribed

    const subscribedChannel = await Subscription.findOne({
        subscriber: subscriberId,
        channel: channelId
    })

    let subscriberStatus;

    if(subscribedChannel) {
        await Subscription.findByIdAndDelete(subscribedChannel._id);
        subscriberStatus = "Unsubscribed";
    } else {
        await Subscription.create({
            subscriber: subscriberId,
            channel: channelId
        });
        subscriberStatus = "Subscribed";
    }
    
    return res
    .status(200)
    .json(
        new ApiResponse(200, subscriberStatus, "Channel Subscribe Status Toggled Successfully")
    )
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params

    console.log("Req params = ", req.params)

    console.log("Channel ID = ", channelId)
    
    if (!channelId.trim() ||!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid Channel")
    }

    const channelSubscribers = await Subscription.aggregate([
        { $match: { channel: new mongoose.Types.ObjectId(`${channelId}`) } },
        {
            $lookup: {
                from: "users",
                localField: "subscriber",
                foreignField: "_id",
                as: "subscriber",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            fullName: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },
        {
            $project: {
                subscriber: 1,
                createdAt: 1
            }
        }
    ])

    return res.status(200).json(new ApiResponse(200, channelSubscribers, "channel's subscribers fetched"));
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
    
    if (!subscriberId.trim() ||!isValidObjectId(subscriberId)) {
        throw new ApiError(400, "Invalid User")
    }

    const subscribedChannels = await Subscription.aggregate([
        {
            $match: { subscriber: new mongoose.Types.ObjectId(`${channelId}`) }
        },
        {
            $lookup: {
                from: "users",
                localField: "channel",
                foreignField: "_id",
                as: "channel",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            fullName: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },
        {
            $project: {
                channel: 1,
                createdAt: 1
            }
        }
    ])

    return res.status(200).json(new ApiResponse(200, subscribedChannels, "success"))
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}