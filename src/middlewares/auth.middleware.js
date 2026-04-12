import { ApiError } from "../utils/ApiError.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import jwt from "jsonwebtoken";
import {User} from "../models/user.models.js"

export const verifyJWT =  asyncHandler(async(req,_,next)=> {
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")
    // no need of try catch here, if error occoured then asyncHandler will take care of it 
    // we write try catch only if we want custom messgage if error occoured
    try {
        if(!token){
            throw new ApiError(401, "Unauthorized request")
        }
    
        const decodedToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET) // this is 
    
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
    
        if(!user){
            throw new ApiError(401,"Invalid Access Token")
        }
    
        req.user =user;// note we injected out user to request
        next()
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token")
    }
})