import { Router } from 'express';
import { registerUser,loginUser,logoutUser,refreshAccessToken,changePassword,getCurrentUser,updateAccountDetails,updateUserAvatar,updateUserCoverImage,getUserChannelProfile} from '../controllers/user.controller.js';
import {upload} from '../middlewares/multer.middleware.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
const router = Router()

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",// this name should be same as form frontend is sending for image field
            maxCount: 1
        },
        {
            name: "coverImage",// same as above
            maxCount:1
        }
    ]),
    registerUser
)


router.route("/login").post(loginUser)

// secured routes
router.route("/logout").post(verifyJWT ,logoutUser)
// generally we write like .post(middleware1, middleware2,...,method) router gets confused which to excute after middleware1 executed that is why we have next() in all middlewares which tells router where to go after it's excution is done
// without middleware if we want ot write code of logout router.route("/logout").post(logoutUser) then see in user.controller

router.route("/refresh-token").post(refreshAccessToken) // this is for again asking server for accessToken from RefreshToken

router.route("/change-password").post(verifyJWT, changePassword) // pach or post?

router.route("/current-user").get(verifyJWT,getCurrentUser)

router.route("/update-account").patch(verifyJWT,updateAccountDetails)
router.route("/avatar").patch(verifyJWT,upload.single("avatar"), updateUserAvatar)
router.route("/cover-image").patch(verifyJWT,upload.single("coverImage"), updateUserCoverImage)

router.route("/c/:username").get(verifyJWT,getUserChannelProfile)
export default router;