import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body

    const userId = req.user?._id;

    if(!name || !name.trim()) {
        throw new ApiError(400, "Missing Playlist Name")
    }

    if(!description || !description.trim()) {
        throw new ApiError(400, "Missing Playlist Description")
    }

    if(!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid User")
    }

    const createdPlaylist = Playlist.create(
        {
            name,
            description,
            owner: userId
        }
    )

    if(!createdPlaylist) {
        throw new ApiError(500, "Something went wrong while creating playlist")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, createdPlaylist, "Playlist Created Successully")
    )
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params

    if(!userId || !userId.trim() || !isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid User");
    }

    const playlists = await Playlist.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        }
    ])

    if(!playlists) {
        throw new ApiError(500, "Unable To Fetch User Playlists")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, playlists, "User Playlists Fetched Successfully")
    )
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params;

    if(!playlistId || !playlistId.trim() || !isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid Playlist");
    }

    const playlist = await Playlist.findById(playlistId);

    if(!playlist) {
        throw new ApiError(500, "Unable To Fetch Playlist")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, playlist, "Playlist Fetched Successfully")
    )

})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params

    if(!playlistId || !playlistId.trim() || !isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid Playlist");
    }

    if(!videoId || !videoId.trim() || !isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid Video");
    }

    const addedVideo = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $push: {videos: videoId}
        },
        { new: true } // returns updated document
    )

    if(!addedVideo) {
        throw new ApiError(500, "Unable To Add Video To The Playlist")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, addedVideo, "Added Video To The Playlist Successfully")
    )

})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params

    if(!playlistId || !playlistId.trim() || !isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid Playlist");
    }

    if(!videoId || !videoId.trim() || !isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid Video");
    }

    const removedVideo = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $pull: {videos: videoId}
        },
        { new: true } // returns updated document
    )

    if(!removedVideo) {
        throw new ApiError(500, "Unable To Remove Video From The Playlist")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, removedVideo, "Removed Video From The Playlist Successfully")
    )

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params

    if(!playlistId || !playlistId.trim() || !isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid Playlist");
    }

    const deletedPlaylist = await Playlist.findByIdAndDelete(playlistId);

    if(!deletedPlaylist) {
        throw new ApiError(500, "Unable To Delete Playlist");
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, deletedPlaylist, "Playlist Deleted Successfully")
    )

})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    
    if(!playlistId || !playlistId.trim() || !isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid Playlist");
    }

    if(!name || !name.trim()) {
        throw new ApiError(400, "Invalid Name");
    }

    if(!description || !description.trim()) {
        throw new ApiError(400, "Invalid Description");
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            name,
            description
        },
        { new: true } 
    )

    if (!updatedPlaylist) {
        throw new ApiError(500, "Unable To Update The Playlist")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, updatedPlaylist, "Playlist Updated Successfully")
    )

})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}