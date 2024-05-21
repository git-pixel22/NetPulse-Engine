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

    console.log(subscribedChannel);

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
    
    if (!channelId.trim() ||!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid Channel")
    }

    try {
        const subscribers = await Subscription.find({
            subscriber: { $ne : null },
            channel: channelId
        }).populate('subscriber');

        return res.status(200).json(
            new ApiResponse(200, subscribers, "Subscribers Fetched Successfully")
        );
    } catch (error) {
        throw new ApiError(500, "Unable To Fetch Subscribers")
    }
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
    
    if (!subscriberId.trim() ||!isValidObjectId(subscriberId)) {
        throw new ApiError(400, "Invalid User")
    }

    try {
        const subscriptions = await Subscription.find({
            subscriber: subscriberId,
            channel: { $ne : null }
        }).populate('channel');

        return res.status(200).json(
            new ApiResponse(200, subscriptions, "Channels Fetched Successfully")
        );
    } catch (error) {
        throw new ApiError(500, "Unable To Fetch Channels")
    }
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}