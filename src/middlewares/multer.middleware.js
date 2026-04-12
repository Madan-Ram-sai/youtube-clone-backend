// Multer is used only when request encoding is multipart/form-data

// If you try:
// Sending file in JSON (not possible)
// Using multer for normal JSON (unnecessary)

import multer from "multer";

// const storage = multer.memoryStorage() // store file in memory as buffer
const storage = multer.diskStorage({
    destination: function(req, file,cb){// cb==call back function
        cb(null,"./public/temp")
    },
    filename: function(req, file,cb){
        // const uniqueSuffix = Date.now() + "-" + Math.round(Math.random()*1E9)// this is for unique file name to avoid overwriting of files with same name
        // const ext = file.originalname.split(".").pop()// get file extension
        // cb(null, file.fieldname + "-" + uniqueSuffix + "." + ext)

        // if we want to keep it simple
        cb(null, file.originalname)
    }
})

export const upload = multer({storage: storage})