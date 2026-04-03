// require('dotenv').config({path: './env'}) but this is consistent so we use import 
import dotenv from 'dotenv';
import connectDB from './db/index.js';
dotenv.config({path: './env'})

connectDB()// returns a promise
.then(async ()=>{
    await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
    app.on("error",(err)=>{
        console.log("APP ERROR!!!", err);
        throw err;
    })
    app.listen(process.env.PORT || 8000,()=>{
        console.log(`Server is running at port: ${process.env.PORT || 8000}`);
    })
})
.catch((err)=>{
    console.log("MONGO DB CONNECTION FAILED!!!", err);
})






/* // as this type of approch is not profisinal

import mongoose from 'mongoose';
import {DB_NAME } from "./constants"
import express from 'express';
const app=express()

;(async () => {
    try{
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        // to listen it use on
        // app.listen(process.env.PORT,()=>{
        //     console.log(`Server is running on port ${process.env.PORT}`);
        // }
        app.on("error",(error)=>{
            console.error("Error: ",err);
             throw err;
        })

        app.listen(process.env.PORT, ()=>{
            console.log(`App is listening on port ${process.env.PORT}`);
        })
    } catch(err){
        console.error("Error: ",err);
        throw err;
    }
})()
*/