import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from 'uuid'; // For unique file names

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

export async function uploadFileToS3(file: File, folder: string): Promise<string> {
  const fileExtension = file.name.split('.').pop();
  const uniqueFileName = `${uuidv4()}.${fileExtension}`;
  const key = `${folder}/${uniqueFileName}`; // e.g., "policies/uuid.pdf"

  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: key,
    Body: Buffer.from(await file.arrayBuffer()),
    ContentType: file.type,
    // ACL: 'public-read', // Removed to avoid AccessControlListNotSupported error
  };

  const command = new PutObjectCommand(params);
  await s3Client.send(command);

  // Return the public URL of the uploaded file
  return `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
}

export async function getSignedFileUrl(key: string): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: key,
  });

  // Generate a signed URL that expires in 1 hour (3600 seconds)
  return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
}

export async function deleteFileFromS3(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: key,
  });
  await s3Client.send(command);
}
