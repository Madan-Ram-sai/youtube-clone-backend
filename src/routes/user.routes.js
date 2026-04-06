import { Router } from 'express';
import { registerUser } from '../controllers/user.controller.js';

const router = Router()

router.route("/register").post(registerUser)
// in futuer we may use 
// router.route("/login").post(loginUser)

export default router;