import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });

const uploadCloudinary = async (localfilePath) => {
    try {
        if(!localfilePath) 
           return null;
        // Upload the file to Cloudinary
       const responce=await cloudinary.uploader.upload(localfilePath, {
            resource_type:'auto'
        })
        //file has been upload
       // console.log("file is uploaded successfull", responce.url);
        
        fs.unlinkSync(localfilePath);
        return responce;
        
    } catch (error) {
        fs.unlinkSync(localfilePath); // Delete the local file if upload fails
        return null;
    }
}

export { uploadCloudinary }
