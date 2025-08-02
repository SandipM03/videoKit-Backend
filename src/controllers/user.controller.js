import {asyncHandler} from '../utils/asyncHandler.js';
import { User } from '../models/user.model.js';
import {apiError} from '../utils/apiError.js'
import {uploadCloudinary} from '../utils/cloudinary.js'
import { apiResponse } from '../utils/apiResponse.js';
import jwt from 'jsonwebtoken';
const generateAccessAndRefreshToken = async (userId)=>{
    try {

        const user= await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
        await user.save({validateBeforeSave: false}) //to save the refresh token in the database
        return {accessToken, refreshToken};

    } catch (error) {
      throw new apiError(500, "Error generating refresh token");   
    }
}

const registerUser= asyncHandler(async(req,res)=>{
 const {fullName,email,username,password} = req.body
 console.log("email:",email);

    if(
        [fullName,email,username,password].some((field)=>
    field?.trim()=== "")

    ){
    throw new apiError(400,"All fields are required")
    }
    const existedUser= await User.findOne({
        $or:[{username},{email}]
    })
    if(existedUser){
        throw new apiError(409,"Username or email already exists")
    }

    const avatarLocalPath=req.files?.avatar[0].path;
    //const coverImageLocalPath=req.files?.coverImage[0].path;

    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImageLocalPath = req.files.coverImage[0].path;

    }



    if(!avatarLocalPath){
        throw new apiError(400,"Avatar image are required")
    }


    const avatar= await uploadCloudinary(avatarLocalPath);
    const coverImage= await uploadCloudinary(coverImageLocalPath);

    if(!avatar){
        throw new apiError(400,"Avatar image upload failed")
    }

    const user =await User.create({
        fullName,
        avater:avatar.url,
        coverImage:coverImage?.url || "",//as if coverImage is not uploaded then it will be null
        username: username.toLowerCase(),
        password,
        email,
    })


    const createduser=await User.findById(user._id).select(
        "-password -refreshToken"
    )
    if(!createduser){
        throw new apiError(500,"something went wrong,while creating user")
    }

    return res.status(201).json(
        new apiResponse(
            200,
            createduser,
            "User registered successfully"
        )
    )

})

const loginUser = asyncHandler(async (req, res) => {
   
      
      const {email,username,password} = req.body;


      if(!username && !email){
        throw new apiError(400, "Username and email are required");
      }

    const user= await User.findOne({
        $or: [{username}, {email} ]
      })
        if(!user){
            throw new apiError(404, "User not found");
        }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if(!isPasswordValid){
        throw new apiError(401, "Invalid password");
    }
    //generate access and refresh token

    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id)

    const loggedInUser= await User.findByIdAndUpdate(user._id).select("-password -refreshToken")
    const options={
        httpOnly:true,
        secure:true,

    }
    return res
    .status(200).cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json({
        user: loggedInUser,accessToken,
        refreshToken,
        message: "user Login successful"
    });

})

const logoutUser= asyncHandler (async (req,res)=>{

 await User.findByIdAndUpdate(
    req.user._id,
    {
        $set:{
            refreshToken: undefined
        }
    },
    {
        new: true,
    }
  ) 
  const options={
    httpOnly:true,
    secure:true,
   
  }
  return res
  .status(200)
  .clearCookie("accessToken", options)
  .clearCookie("refreshToken", options)
  .json(new apiResponse(200,{}, "User logged out "))

})

const refereshAccessToken = asyncHandler(async (req, res) => {
   const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken 
    if (!incomingRefreshToken) {
        throw new apiError(401, "unauthorized request");

    }
   try {
    const decodedToken= jwt.verify(
         incomingRefreshToken,
         process.env.REFRESH_TOKEN_SECRET,
 
        
     )
     const user= await User.findById(decodedToken?._id)
 
     if (!user){
         throw new apiError(404, "Invalid refresh token");
     }
     if(incomingRefreshToken !== user.refreshToken){
         throw new apiError(401, "refresh token is experied or used");
     }
 
 
     const options={
         httpOnly:true,
         secure:true,
     }
 
     const {accessToken, newRefreshToken} = await generateAccessAndRefreshToken(user._id)
     return res
     .status(200)
     .cookie("accessToken", accessToken, options)
     .cookie("refreshToken", newRefreshToken, options)
     .json(
         new apiResponse(
             200,
             {accessToken, refreshToken: newRefreshToken},
             "Access token refreshed successfully"
         )
     )
   } catch (error) {
       throw new apiError(401,error?.message || "Invalid refresh token");
   }
})

const changeCurrentPassword= asyncHandler(async (req, res)=>{
    try {
        const {oldpassword, newPassword, confirmPassword} = req.body;
        if(!(newPassword === confirmPassword)){
            throw new apiError(400, "New password and confirm password do not match");
        }
        const user = await User.findById(req.user._id);
        const isPasswordCorrect= await user.isPasswordCorrect(oldpassword);
        if(!isPasswordCorrect){
            throw new apiError(401, "Old password is incorrect");
        }
        user.password = newPassword;
        await user.save({validateBeforeSave: false});
        return res.status(200)
        .json(
            new apiResponse(200, {}, "Password changed successfully")
        )
    } catch (error) {
        throw new apiError(500, error?.message || "Something went wrong while changing password");
        
    }
})

const getCurrentUser= asyncHandler(async (req, res)=>{
    return res.status(200).json(
        new apiResponse(200, req.user, "Current user fetched successfully")
    )
    

})

const updateAccountDetails = asyncHandler(async (req, res) => {
    const {fullName, email} = req.body;
    if(!fullName || !email){
        throw new apiError(400, "Full name and email are required");
    }
    const user = await User.findByIdAndUpdate(req.user._id,{
        
        $set:{
        fullName,
        email
    }
    }, {new: true}
).select("-password");
   
    return res.status(200).json(
        new apiResponse(200, user, "User details updated successfully")
    )
})


const updateUserAvatar= asyncHandler(async (req,res)=>{
    const avatarLocalPath= req.file?.path
    if(!avatarLocalPath){
        throw new apiError(400, "Avatar image is required");
    }
    const avatar = await uploadCloudinary(avatarLocalPath);
    if(!avatar.url){
        throw new apiError(400, "error while uploading avatar image");

    }
   const user= await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                avatar: avatar.url
            }
        },
        {new: true}
    )
    .select("-password ")
     return res
     .status(200)
     .json(
        new apiResponse(200, user, "avater image updated successfully")
    )
    
})

const updateUserCoverImage= asyncHandler(async (req,res)=>{
    const coverImageLocalPath= req.file?.path;
    if(!coverImageLocalPath){
        throw new apiError(400, "Cover image is required");
    }
    const coverImage = await uploadCloudinary(coverImageLocalPath);
    if(!coverImage.url){
        throw new apiError(400, "error while uploading cover image");
    }
   const user= await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                coverImage: coverImage.url
            }
        },
        {new: true}
    )
    .select("-password ")
    return res
    .status(200)
    .json(
        new apiResponse(200, user, "Cover image updated successfully")
    )

})

const getUserChannelProfile= asyncHandler(async (req,res)=>{
    const {username} = req.params;
    if(!username?.trim()){
        throw new apiError(400, "Username is missing");

    }
    const channel = await User.aggregate([
        {
            $match:{
                username: username?.toLowerCase()
            }
        },
        {
            $lookup:{
                from: "subscription",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $lookup:{
                from: "subscription",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }
        },
        {
            $addFields:{
                subscriberCount: {$size: "$subscribers"},
                channelSubscribedToCount: {$size: "$subscribedTo"},
                isSubscribed: {
                    $cond:{
                        if:{ $in:[req.user?._id,"$subscribers.Subscriber"]},
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project:{
                fullName: 1,
                username: 1,
                avatar: 1,
                coverImage: 1,
                subscriberCount: 1,
                channelSubscribedToCount:1,
                isSubscribed: 1,
                email: 1,
            }
        }
    ])

    console.log("channel:", channel);
    
    if(!channel || channel.length === 0){
        throw new apiError(404, "Channel not found");
    }
    return res.status(200).json(
        new apiResponse(200, channel[0], "Channel profile fetched successfully")
    )

})

const getWatchHistory= asyncHandler(async (req, res)=>{
    const user= await User.aggregate([
        {
            $match:{
                _id: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup:{
                from: "video",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline:[
                    {
                        $lookup:{
                            from: "user",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline:[
                                {
                                    $project:{
                                        fullName: 1,
                                        username: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                       $addFields:{
                        owner:{
                            $first: "$owner"// for extract value from filed use $
                        }
                       } 
                    }
                ]
            }
        }

    ]) 
    return res.status(200)
    .json(
        new apiResponse( 200, user[0].watchHistory,
            "Watch History fetched Succesfully"
        )
    )
})

export {
    registerUser, 
    loginUser,
    logoutUser,
    refereshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory
};