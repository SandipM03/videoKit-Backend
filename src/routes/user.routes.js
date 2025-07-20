import {Router} from 'express';
import { 
    loginUser, 
    registerUser,
    logoutUser,
    refereshAccessToken,
    changeCurrentPassword, 
    getCurrentUser, 
    updateAccountDetails, 
    updateUserAvatar, 
    updateUserCoverImage, 
    getUserChannelProfile, 
    getWatchHistory
 } from '../controllers/user.controller.js';
import {upload} from '../middlewares/multer.middlewares.js';
import { userImageUpload } from '../middlewares/multer.middlewares.js';
import { veryfyJWT } from '../middlewares/auth.middleware.js';
const router =Router();

router.route("/register").post(
    upload.fields([
        {
            name:"avatar",
            maxCount: 1
        },
        {
            name:"coverImage",
            maxCount: 1
        }
    ]),
    registerUser,userImageUpload
)
router.route("/login").post(loginUser)
//secure route
router.route("/logout").post(veryfyJWT, logoutUser);
router.route("/refresh-token").get(refereshAccessToken);
router.route("/change-password").post(veryfyJWT, changeCurrentPassword);
router.route("/current-user").get(veryfyJWT, getCurrentUser);
router.route("/update-account").patch(veryfyJWT,updateAccountDetails);
router.route("/avatar").patch(veryfyJWT,upload.single("avatar"),updateUserAvatar)
router.route("/cover-image").patch(veryfyJWT, upload.single("coverImage"), updateUserCoverImage);
router.route("/c/:username").get(veryfyJWT,getUserChannelProfile)//as we use params in username
router.route("/history").get(veryfyJWT, getWatchHistory);


export default router;