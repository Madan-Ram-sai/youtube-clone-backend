// use http://localhost:8000/users/register  in postman to test 
import {asyncHandler} from '../utils/asyncHandler.js';
import {ApiError} from '../utils/ApiError.js';
import {User} from '../models/user.models.js';
import {uploadOnCloudinary} from '../utils/cloudinary.js'
import { ApiResponse } from '../utils/ApiResponse.js';
import jwt from 'jsonwebtoken';

const registerUser = asyncHandler(async (req,res)=>{
    // return res.status(200).json({
    //     message: "Ok , this route is working fine"
    // }) // this was just for testing now for for actual implementation we first write logic and steps
    
    //get user details from frontend
    // validation - like not empty or email format etc..
    // check if user already exists in database: with username or email depends
    // check for images, avatar
    // upload image to cloudinary and get the url
    // create user object - create entry and save user to database
    // remove password and refresh token fields from response and send response to frontend
    // check user creation 
    // return res
    
    // data is coming from form or json body then we can use req.body 
    const {username,email,fullName,password} = req.body;
    // if we are getting data from url then we can use req.params or req.query depending on how the data is sent
    console.log("username:", username, "\nemail: ",email,fullName);//  in postman i.e. in raw->json format order is not important , if all fiels are not sent from postmen then we get undefined for those fields.
    // console.log("req.body: ",req.body)
    if(
        [fullName,email,username,password].some((field)=>
            field?.trim()==="")// if field is present then trim(i.e remove extra spaces) and after that if it is empty then condition is true (this applies to all fields)
    ){// if even one field is empty , for email we can include @ and .com validation ....
        throw new ApiError(400,"All fields are compulsory")
    }
    
    // const existeduser = await User.findOne({username}) // we will check this username is already present in db or not
    // if we want to find with email and username both then we can use $or operator of mongodb
    
    const existeduser = await User.findOne({// User will call database , as we have to find something in database so we need async ,await
        $or: [{ username },{ email }]
    })
    if(existeduser){
        throw new ApiError(400, "User with this username or email already exists")
    }
    // images etc.. we will get from req.files,
    const avatarLocalPath = req.files?.avatar[0]?.path;// if we are getting single image then we can use req.file and if multiple then req.files and "avatar" is same name given in user.routes.js , same for below coverImage as well

    // const coverImageLocalPath = req.files?.coverImage[0]?.path; // we will get TypeError: Cannot read properties of undefined (reading &#39;0&#39;)
    // bez. it is not mandetory for cover image right then .coverImage how can we access if not present ha.. so write like below

    const coverImageLocalPath = req.files?.coverImage?.[0]?.path;
    //or
    // let coverImageLocalPath;
    // if(req.files && req.files.coverImage && req.files.coverImage.length > 0){
    //     coverImageLocalPath= req.files.coverImage[0].path
    // }

    // console.log("files: ", req.files) 
    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar is required")
    }
    // we cdr, coverImage is not mandatory
    
    // NOW UPLOADING TO CLOUDINARY
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    // const coverImg = coverImageLocalPath && await uploadOnCloudinary(coverImageLocalPath)// coverImageLocalPath && bez. if not there then it won't proceede
    const coverImg = await uploadOnCloudinary(coverImageLocalPath)// no need of 'coverImageLocalPath &&' bez. if not there then cloudnary will write null
    console.log("avatar is:" ,avatar)

    if(!avatar){
        throw new ApiError(400, "Avatar is required")
    }
    
    // create user object - create entry and save user to database
    const user = await User.create({// here fields order don't matter i.e. this order neednot to be same as user.models.js
        fullName,
        avatar: avatar.url,
        coverImage: coverImg?.url|| "",
        email,
        password,
        username: username.toLowerCase()
    })// if in mongodb if this entry is successfully created then _id(unique) is created

    // check user creation and remove password and refreshtoken fields
    const isuserCreated = await User.findById(user._id).select(// to check user is created or not , and also it returns the user document if created successfully
        "-password -refreshToken"// -ve means it is not required
    )
    if(!isuserCreated){
        throw new ApiError(500, "User registration failed, please try again")
    }

    return res.status(201).json(// any other way to write this??
        new ApiResponse(200,isuserCreated, "User Registered Successfully")
    )
})


const generateAccessAndRefreshToken= async (userId) => {
    try {
        const user =await User.findById(userId)

        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave:false })

        return {accessToken,refreshToken}
    }catch (error) {
        throw new ApiError(500,"Something went wrong while generating token")
    }
}

const loginUser = asyncHandler(async (req,res) =>{
    // req body -> data (take username password)
    // username based login or email based
    // check from db is that user exist
    // check username and password correct
    // generate refresh token and acces token
    // send cookies

    const {email, username, password} = req.body

    if(!(username || email)){
        throw new ApiError(400, "username or email is required")
    }

    // User.findOne({username});
    // User.findOne({email}); // any one of user and email
    const user = await User.findOne({ $or: [{username},{email}]})
    // note:- User is object of mongoose , and user is current user created

    if(!user){
        throw new ApiError(404, "User doesnot exist!!")
    }
    
    const isPassValid = await user.isPasswordCorrect(password)// password is that which we got from req body
    
    if(!isPassValid){
        throw new ApiError(401, "password is incorrect")
    }

    const {accessToken, refreshToken} =await generateAccessAndRefreshToken(user._id)

    // note:here in user, refreshToken is empty bcs after creating user we called is valid right so it dont have refreshToken
    // so either update user or call db again

    const loggedInUser= await User.findById(user._id).select("-password -refreshToken")

    // for cookies 
    // cookies are bydefault modifible from frontend but we want to make it unmodifiable so we will use httpOnly and secure flag
    const options={
        httpOnly: true,
        secure: true
    }

    return res.status(200).cookie("refreshToken",refreshToken,options).cookie("accessToken",accessToken,options)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser, refreshToken,accessToken
            },
            "User Loggedin Successfully"
        )
    )
})

const logoutUser = asyncHandler(async(req,res)=>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new:true
        }
    )

    const options={
        httpOnly: true,
        secure: true
    }

    return res.status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200,{},"User logged Out Successfully"))

})

/*
// without middleware -> ❌not recomended 
const logoutUser = asyncHandler(async(req,res)=>{
    // the same thing which we wrote in middle ware 
    if(!token){
        throw new ApiError(401, "Unauthorized request")
    }

    const decodedToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET) // this is 

    const user = await User.findById(decodedToken?._id).select("-password -refreshToken")

    if(!user){
        throw new ApiError(401,"Invalid Access Token")
        }
        
        req.user =user;
        
        await User.findByIdAndUpdate(
            ..... same code as above
            
            // this code is not recommended because it is redudent and not reusable 
            
})
*/

const refreshAccessToken = asyncHandler(async (req,res)=>{// this is for again asking server for accessToken from RefreshToken
    const incomingRefreshToken = req.cookies?.refreshToken || req.body.refreshToken

    if(!incomingRefreshToken){
        throw new ApiError(401,"Unauthorized request i.e. RefreshToken is wrong")
    }

    const decodedToken = jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)

    const user = await User.findById(decodedToken?._id)

    if(!user){
        throw new ApiError(401,"Invalid refresh Token")
    }
    if(incomingRefreshToken !== user?.refreshToken){
        throw new ApiError(401,"Refresh Token expired or used")
    }

    const {accessToken, newRefreshToken} = await generateAccessAndRefreshToken(user._id)// here it will generate new refresh token so change name
    // if here if write {accessToken, refreshToken} then also no problem
    const options={
        httpOnly: true,
        secure: true
    }

    return res.status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",newRefreshToken,options)
    .json(
        new ApiResponse(200,{accessToken, refreshToken: newRefreshToken},"Access token refreshed")
    )
})

export {registerUser, loginUser, logoutUser, refreshAccessToken} 