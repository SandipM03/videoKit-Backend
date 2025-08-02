import {apiError} from "../utils/apiError.js"
import {apiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const healthcheck = asyncHandler(async (req, res) => {
    
    try {
    return res
      .status(200)
      .json(
        new apiResponse(200, { status: "OK" }, "Service is running smoothly")
      );
  } catch (error) {
    throw new apiError(500, "Healthcheck failed. Something went wrong.");
  }
})

export {
    healthcheck
    }
    