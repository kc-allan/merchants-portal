import Config from "../Config/index.js";
import cloudinary from "cloudinary";

const { CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = Config;

cloudinary.v2.config({
    cloud_name: CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
});

const uploads = (filePath, folder) => {
    return new Promise((resolve, reject) => {
        cloudinary.v2.uploader.upload(
            filePath,
            { resource_type: "auto", folder: folder },
            (error, result) => {
                if (error) reject(error);
                else
                    resolve({
                        url: result.secure_url,
                        id: result.public_id,
                    });
            }
        );
    });
};


export default uploads;
