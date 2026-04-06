import {asyncHandler} from '../utils/asyncHandler.js';

const registerUser = asyncHandler(async (req,res)=>{
    return res.status(200).json({
        message: "Ok , this route is working fine"
    })
})

export {registerUser}