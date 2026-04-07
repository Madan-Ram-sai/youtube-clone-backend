// this is for hadling file upload to cloudinary
// this is first way 2 step process first uploaded to our server and then moved to cloudinary
import {v2 as cloudinary} from "cloudinary"
import fs from "fs" // file system module of node js to handle files(here unlink means delete )

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

const uploadOnCloudinary = async (localFilePath)=>{
    try{
        if(!localFilePath) return null
        // upload file on cloudinary and get the url 
        const response = await cloudinary.uploader.upload(localFilePath,{
            resource_type:"auto",
        })
        // file uploaded successfully 
        console.log("file uploaded on cloudinary successfully", response, "file url", response.url)
        fs.unlinkSync(localFilePath)
        return response;

    }catch(error){
        console.log("error while uploading file on cloudinary", error)
        fs.unlinkSync(localFilePath) // delete the file from local storage if error occurs while uploading on cloudinary
        return null
    }
}

export { uploadOnCloudinary}