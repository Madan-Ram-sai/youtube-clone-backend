import { Router } from 'express';
import { registerUser,loginUser,logoutUser } from '../controllers/user.controller.js';
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


export default router;