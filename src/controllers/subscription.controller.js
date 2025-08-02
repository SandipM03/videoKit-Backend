import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {apiError} from "../utils/apiError.js"
import {apiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    
    const user= req.user;
    if(!user){
        throw new apiError(401, "User needs to be logged in")
    }
       if(!isValidObjectId(channelId)){
            throw new apiError(400, "Invalid channel ID")
        }
        if(user.toString()=== channelId.toString()){
            throw new apiError(400, "You cannot subscribe to your own channel")
        }
    try {
        
        const existingSubscription = await Subscription.findOne({
            subscriber: user._id,
            channel: channelId
        })
        if(existingSubscription){
          const deletedSubscription = await Subscription.findByIdAndDelete(existingSubscription._id)
            return res.status(200)
                .json(new apiResponse(200, deletedSubscription, "Unsubscribed successfully"))
        }else{
            const newSubscription= await Subscription.create({
                subscriber: user._id,
                channel: channelId
            })
            return res.status(201)
                .json(new apiResponse(201, newSubscription, "Subscribed successfully"))
        }

    } catch (error) {
        throw new apiError(500, error.message || "Internal Server Error")
        
    }

})


const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    const user = req.user;
    if(!user){
        throw new apiError(401, "User needs to be logged in")
    }
    if(!isValidObjectId(channelId)){
        throw new apiError(400, "Invalid channel ID")
    }
    try {
        
        const channelList= await Subscription.find({channel: channelId}).populate("subscriber", "_id name email")
        if(!channelList || channelList.length === 0){
            throw new apiError(404, "No subscribers found for this channel")
        }
        return res.status(200)
            .json(new apiResponse(200, channelList, "Subscribers fetched successfully"))
    } catch (error) {
        throw new apiError(500, error.message || "Internal Server Error")
        
    }

})


const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
    const user = req.user;
    if(!user){
        throw new apiError(401, "User needs to be logged in")
    }
    if(!isValidObjectId(subscriberId)){
        throw new apiError(400, "Invalid subscriber ID")
    }
    try {
        const getSubscribedChannelsList= await Subscription.find({subscriber: subscriberId}).populate("channel", "_id name email ")
        if(!getSubscribedChannelsList || getSubscribedChannelsList.length === 0){
            throw new apiError(404, "No channels found for this subscriber")
        }
        return res.status(200)
            .json(new apiResponse(200, getSubscribedChannelsList, "Subscribed channels fetched successfully"))

    } catch (error) {
        throw new apiError(500, error.message || "Internal Server Error")
    }
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}