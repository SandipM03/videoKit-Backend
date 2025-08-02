import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {apiError} from "../utils/apiError.js"
import {apiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query="", sortBy="createdA", sortType="desc", userId } = req.query
    
    if(!req.user){
        throw new apiError( 401, "user need to be logged in")
    }
      
    const match={
        ...(query ? {title: {$regex: query, $options: "i"}} : {}),
        ...(userId?{owner: mongoose.Types.ObjectId(userId)}:{}) 
    };


    
    const videos= await Video.aggregate([
        {
            $match: match  
        },
        {
            $lookup:{
                from: "users", 
                localField: "owner",
                foreignField: "_id",
                as: "videosByOwner"
            }
        },
        {
            
            $project:{
                videoFile: 1,
                thumbnail: 1,
                title: 1,
                description: 1,
                duration: 1,
                views: 1,
                isPublished: 1,
                owner:{
                    $arrElemAt: ["$videosByOwner", 0] 
                }
            }
        },

        {
            $sort: {
                [sortBy]: sortType === "desc"?-1:1,
            }
        },
        {
            $skip: (page - 1) * parseInt(limit) 
        },

        {
            $limit:  parseInt(limit),
            
        }



    ])

    if(!videos?.length===0){
        throw new apiError(401,"Videos are not found")
    }
    return res
    .status(200)
    .json(new apiResponse(200, videos, "Videos fetched successfully"))
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description, owner } = req.body
   

    if(!req.user){
        throw new apiError(401, "User needs to be logged in")
    }
    if(!title){
        throw new apiError(400, "Title is required")
    }
    if(!description){
        throw new apiError(400, "Description is required")
    }
    
    if(!owner || !isValidObjectId(owner)){
        throw new apiError(400, "Valid owner ID is required")
    }
    const videoFileLocalPath= req.files?.videoFile[0]?.path;
    if(!videoFileLocalPath){
        throw new apiError(400, "Video file is required")
    }
    const thumbnailLocalPath= req.files?.thumbnail[0]?.path;
    if(!thumbnailLocalPath){
        throw new apiError(400, "Thumbnail is required")
    }


    try {
        const duration= await getVideoDurationIn(videoFileLocalPath)
        const videoFile = await uploadCloudinary(videoFileLocalPath, "video")
        if(!videoFile){
            throw new apiError(409,"Cloudinary Error: Video file is required")
        }
        const thumbnail = await uploadCloudinary(thumbnailLocalPath, "image")
        if(!thumbnail){
            throw new apiError(400,"Cloudinary Error: Thumbnail is required")
        }


        const videoDoc= await Video.create({

            videoFile:videoFile.url,
            thumbnail:thumbnail.url,
            title,
            description,
            owner: req.user?._id,
            duration
        })

        console.log(`Title:${title},Owner: ${owner}, Duration: ${duration}`);
        if(videoDoc){
            throw new apiError(500,"Something went wrong while publishing a video")
        }
        return res
        .status(201)
        .json(new apiResponse(201, videoDoc, "Video published successfully"))
    } catch (error) {
        throw new apiError(500, error.message || "Internal Server Error")
    }
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
   
    if(!isValidObjectId(videoId)){
        throw new apiError(400, "Invalid video ID")
    }

    try {
        const video = await Video.findById(videoId).populate("owner", "name email profilePicture")
        if(!video){
            throw new apiError(404, "Video not found")
        }
        return res
        .status(200)
        .json(new apiResponse(200, video, "Video fetched successfully"))
        
    } catch (error) {
        throw new apiError(500, error.message || "Internal Server Error")
        
    }
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    
    const { title, description } = req.body;
    let updateData= {title, description};
    
    if(!isValidObjectId(videoId)){
        throw new apiError(400, "Invalid video ID")
    }
    if(!req.user){
        throw new apiError(401, "User needs to be logged in")
    }
    
    try {
        if (req.file){
            const videoFileLocalPath= req.file.path
            if(!thumbnailLocalPath){
                throw new apiError(400, "Thumbnail is required")
            }
            const thumbnail= await uploadCloudinary(thumbnailLocalPath)
            if(!thumbnail.url){
                throw new apiError(409, "Cloudinary Error: Thumbnail is required")
            }
            updateData.thumbnail = thumbnail.url;
        }
        const updateVideo = await Video.findByIdAndUpdate(
            videoId,
            {$set: updateData},
            {new: true, runValidators: true}
        );
        if(!updateVideo){
            throw new apiError(404, "Video not found")
        }
        return res
        .status(200)
        .json(new apiResponse(200, updateVideo, "Video updated successfully"))
    } catch (error) {
        throw new apiError(500, error.message || "Internal Server Error")
    }
})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
    if(!req.user){
        throw new apiError(401, "User needs to be logged in")
    }
    if(!isValidObjectId(videoId)){
        throw new apiError(400, "Invalid video ID")
    }
    try {
        const deleteVideo= await Video.findByIdAndDelete(videoId)
        if(!deleteVideo){
            throw new apiError(404, "Video not found")
        }
        return res
        .status(200)
        .json(new apiResponse(200, deleteVideo, "Video deleted successfully"))
    } catch (error) {
        throw new apiError(500, error.message || "Internal Server Error")
    }
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    try {
        if(!req.user){
            throw new apiError(401, "User needs to be logged in")
        }
        if(isValidObjectId(videoId)){
            throw new apiError(400, "Invalid video ID")
        }
        const video = await Video.findById(videoId)
        if(!video){
            throw new apiError(404, "Video not found")
        }
        video.isPublished= !video.isPublished // Toggling the publish status
        await video.save() 
        return res.status(200)
        .json(new apiResponse(200, video,"Video publish status toggled successfully"))
    } catch (error) {
        throw new apiError(500, error.message || "Internal Server Error")
    }

})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}