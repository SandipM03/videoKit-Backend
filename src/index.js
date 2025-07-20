//require('dotenv').config({path:'./env'});
import dotenv from 'dotenv';
import connectDB from './db/index.js';
//import express from 'express';
import { app } from './app.js';
dotenv.config({
    path:'./env'
});

//const app = express();


connectDB()
.then(()=>{
    //also can do these 
 //const PORT = process.env.PORT || 8000; then use PORT in app.listen
 
    app.listen(process.env.PORT||8000,()=>{
        console.log(`server is running on port: ${process.env.PORT}`);
        console.log("mongodb connection successful");
    })
})
.catch((error)=>{
    console.log("mongodb connection error:",error);
    
})























//1st approach to connect to MongoDB
//but it make index file messay so we 
// can amke a db folder and from there we can import
/*

import express from 'express';
const app = express();
(async()=>{
    try {
       await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
       app.on("error",(error)=>{
        console.log('ERROR:',error);
        throw error
       })
       app.listen(process.env.PORT,()=>{
        console.log(`app is listening on port ${process.env.PORT}`);
       })


    } catch (error) {
        console.error('ERROR:', error);
        throw error;
    }
})()
*/

