import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';



const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"})) //Handles form submissions (like HTML forms) and allows you to access the form data in req.body. The extended: true option allows for rich objects and arrays to be encoded into the URL-encoded format, which can be useful for handling complex form data. The limit: "16kb" option sets a maximum size for the incoming request body, helping to prevent abuse by limiting the amount of data that can be sent in a single request.
app.use(express.static("public")) // used for images etc.. 
app.use(cookieParser())

// Routes import
import userRouter from './routes/user.routes.js'

// Routes decleration
// previously we use app.get , as we were writing both .get(i.e. routes) and .post(i.e. controller) in the same file, but now we have seprated them into different folders so we need use middle ware to get router so we use app.use() 
app.use("/users", userRouter)



export {app}