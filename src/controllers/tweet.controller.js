import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {apiError} from "../utils/apiError.js"
import {ApiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const {content} = req.body;
    try {
        const ownerId= req.user?._id;
        if(!req.user){
            throw new apiError(401, "User needs to be logged in")
        }
        if(!content){
            throw new apiError(400, "Content is required")
        }
        const newTweet = await Tweet.create({content, owner: ownerId})
        if(!newTweet){
            throw new apiError(500, "Failed to create tweet")
        }
    
        return res
            .status(201)
            .json(new ApiResponse(201, newTweet, "Tweet created successfully"))
    } catch (error) {
        throw new apiError(500, error.message || "Internal Server Error")
    }
    
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const {userId }= req.params;
    try {
        if(!isValidObjectId(userId)){
            throw new apiError(400, "Invalid user ID")
        }
        const tweet= await Tweet.find({owner: userId}).sort({createdAt:-1});
        if(!tweet || tweet.length === 0){
            throw new apiError(404, "No tweets found for this user")
        }
        return res
            .status(200)
            .json(new ApiResponse(200, tweet, "User tweets fetched successfully"))
    } catch (error) {
        throw new apiError(500, error.message || "Internal Server Error")
        
    }

})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const {tweetId} = req.params;
    const {content} = req.body;
    
    try {
        if(!req.user){
            throw new apiError(401, "User needs to be logged in")
        }
        if(!isValidObjectId(tweetId)){
            throw new apiError(400, "Invalid tweet ID")
        }
        if(!content){
            throw new apiError(400, "Content is required")
        }

        // Check if tweet exists and belongs to the user
        const existingTweet = await Tweet.findById(tweetId);
        if(!existingTweet){
            throw new apiError(404, "Tweet not found")
        }
        if(existingTweet.owner.toString() !== req.user._id.toString()){
            throw new apiError(403, "You can only update your own tweets")
        }

        const tweet = await Tweet.findByIdAndUpdate(
            tweetId,
            {
                $set:{
                    content
                }
            },
            {new: true}
        );
        if(!tweet){
            throw new apiError(404, "Tweet not found")
        }
        return res.status(200).json(
            new ApiResponse(200, tweet, "Tweet updated successfully")
        )
    } catch (error) {
        throw new apiError(500, error.message || "Internal Server Error")
    }
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const {tweetId} = req.params;
    try {
        if(!req.user){
            throw new apiError(400,"User need to login")
        }
        if(!isValidObjectId(tweetId)){
            throw new apiError(400,"Invalid tweet ID")
        }
        const existingTweet = await Tweet.findById(tweetId);
        if(!existingTweet){
            throw new apiError(404, "Tweet not found")
        }
        if(existingTweet.owner.toString()!== req.user._id.toString()){
            throw new apiError(403, "You can only delete your own tweets")
        }
        const deletedTweet = await Tweet.findByIdAndDelete(tweetId);
        if(!deletedTweet){
            throw new apiError(500, "Failed to delete tweet")
        }
        return res.status(200).json(
            new ApiResponse(200, deletedTweet, "Tweet deleted successfully")
        )
    } catch (error) {
        throw new apiError(500, error.message || "Internal Server Error")
    }
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}