import { Router } from 'express';
import { registerUser } from '../controllers/user.controller.js';
import {upload} from '../middlewares/multer.middleware.js';
const router = Router()

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",// this name should be same as form frontend is sending for image field
            maxCount: 1
        },
        {
            name: "images",// same as above
            maxCount:1
        }
    ]),
    registerUser
)
// in futuer we may use 
// router.route("/login").post(loginUser)

export default router;