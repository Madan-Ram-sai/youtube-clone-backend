require('dotenv').config()// this line is for import dotenv package and use it to load environment variables from .env file

const express = require('express')
// above line other way import express from "express"
const app = express()
const port = 3000// this port may not be avalible for other at some time
// and all this code should not be published i.e some part should be stored

// get is for listen
app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.get('/twitter',(req,res)=>{
    res.send('<h1>Madan Twitter</h1>');
})

app.get('/about',(req,res)=>{
    res.send('<h3> this is express</h3>');
})

app.listen(process.env.PORT, () => {
  console.log(`Example app listening on port ${port}`)
})