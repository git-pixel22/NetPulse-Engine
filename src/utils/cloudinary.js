import {v2 as cloudinary} from 'cloudinary';
import fs from "fs"
          
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if(!localFilePath) return null
        //upload file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        // after successfull file upload, remove the file
        console.log("File Uploaded On Cloudinary: ", response.url);
        fs.unlinkSync(localFilePath)
        return response;

    } catch (error) {
        fs.unlinkSync(localFilePath);
        return null;
    }

}

const deleteOldImageOnCloudinary = (imageUrl) => {
    const publicIdMatch = imageUrl.match(/\/([^/]+)\.png$/);
    
    if (!publicIdMatch) {
        console.log("Pattern not found in URL.");
        return Promise.reject("Pattern not found in URL.");
    }

    const publicId = publicIdMatch[1];
    console.log(publicId); // Log the public id of the image

    return new Promise((resolve, reject) => {
        cloudinary.uploader.destroy(publicId, (error, result) => {
            if (error) {
                console.error(error, "File was not deleted from Cloudinary");
                reject(error); // Reject the Promise if there's an error
            } else {
                console.log(result);
                resolve(result); // Resolve the Promise with the result if successful
            }
        });
    });
}


export {uploadOnCloudinary, deleteOldImageOnCloudinary}
