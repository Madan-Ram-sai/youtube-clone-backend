// use http://localhost:8000/users/register  in postman to test 
import {asyncHandler} from '../utils/asyncHandler.js';
import {ApiError} from '../utils/ApiError.js';
import {User} from '../models/user.models.js';
import {uploadOnCloudinary} from '../utils/cloudinary.js'
import { ApiResponse } from '../utils/ApiResponse.js';


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
    const coverImg = coverImageLocalPath && await uploadOnCloudinary(coverImageLocalPath)// coverImageLocalPath && bez. if not there then it won't procide
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

export {registerUser} 