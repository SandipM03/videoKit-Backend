import mongoose,{isValidObjectId} from "mongoose"
import {Comment} from "../models/comment.model.js"
import {apiError} from "../utils/apiError.js"
import {apiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query
     if (!isValidObjectId(videoId)) {
    throw new apiError(400, "Invalid video ID");
  }

  console.log("Video ID:", videoId, "Type:", typeof videoId); 

   const videoObjectId = new mongoose.Types.ObjectId(videoId);

   const comments = await Comment.aggregate([
    {
      $match: {
        video: videoObjectId,
      },
    },
     {
      
      $lookup: {
        from: "videos",
        localField: "video",
        foreignField: "_id",
        as: "CommentOnWhichVideo",
      },
    },
    {
      
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "OwnerOfComment",
      },
    },
     {
     
      $project: {
        content: 1, 
        owner: {
          $arrayElemAt: ["$OwnerOfComment", 0], 
        },
        video: {
          $arrayElemAt: ["$CommentOnWhichVideo", 0], 
        },
        createdAt: 1, // Include timestamp
      },
    },

    {
      
      $skip: (page - 1) * parseInt(limit),
    },

    {
      $limit: parseInt(limit),
    },
  ]);
  console.log(comments); 

  
  if (!comments?.length) {
    throw new apiError(404, "Comments are not found");
  }

 
  return res
    .status(200)
    .json(new apiResponse(200, comments, "Comments fetched successfully"));



})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
     const { videoId } = req.params;
     const { content } = req.body;
      if (!isValidObjectId(videoId)) {
    throw new apiError(400, "Invalid video ID");
  }
   if (!req.user) {
    throw new apiError(401, "User needs to be logged in");
  }
  if (!content) {
    throw new apiError(400, "Empty or null fields are invalid");
  }
   const addedComment = await Comment.create({
    content,
    owner: req.user?.id, // Linking comment to the logged-in user
    video: videoId, // Linking comment to the video
  });
   if (!addedComment) {
    throw new apiError(500, "Something went wrong while adding comment");
  }
   return res
    .status(200)
    .json(
      new apiResponse(200, addedComment, videoId, "Comment added successfully")
    );

})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const { commentId } = req.params;
    const { content } = req.body;
    if (!isValidObjectId(commentId)) {
    throw new apiError(400, "Invalid comment ID");
  }
  if (!req.user) {
    throw new apiError(401, "User must be logged in");
  }

  /*
    Checking if the updated content is empty
    - Comments must have some text
  */
  if (!content) {
    throw new apiError(400, "Comment cannot be empty");
  }
  const updatedComment = await Comment.findOneAndUpdate(
    {
      _id: commentId,
      owner: req.user._id, // Ensures users can only update their own comments
    },
    {
      $set: {
        content,
      },
    },
    { new: true } // Return the updated comment instead of the old one
  );
   if (!updatedComment) {
    throw new apiError(500, "Something went wrong while updating the comment");
  }
    return res
    .status(200)
    .json(new apiResponse(200, updatedComment, "Comment successfully updated"));


})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const { commentId } = req.params;

  // Check if the commentId is a valid MongoDB ObjectId
  if (!isValidObjectId(commentId)) {
    throw new apiError(400, "Invalid comment ID");
  }

  // Check if the user is logged in
  if (!req.user) {
    throw new apiError(401, "User must be logged in");
  }
     const deletedCommentDoc = await Comment.findOneAndDelete({
    _id: commentId,
    owner: req.user._id, // Ensuring only the owner can delete their comment
  });
    if (!deletedCommentDoc) {

    throw new apiError(500, "Something went wrong while deleting the comment");
  }
    return res
    .status(200)
    .json(
      new apiResponse(200, deletedCommentDoc, "Comment deleted successfully")
    );
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }