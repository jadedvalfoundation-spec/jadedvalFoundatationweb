import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export { cloudinary };

export async function uploadImage(
  file: string,
  folder: string = "jadedval_foundation"
) {
  const result = await cloudinary.uploader.upload(file, {
    folder,
    resource_type: "auto",
  });
  return result;
}

export async function deleteImage(publicId: string) {
  const result = await cloudinary.uploader.destroy(publicId);
  return result;
}

export function getCloudinaryUrl(
  publicId: string,
  options?: { width?: number; height?: number; quality?: string }
) {
  return cloudinary.url(publicId, {
    secure: true,
    ...options,
  });
}
