import { NextResponse } from 'next/server';
import { getSignedFileUrl } from '@/lib/s3';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const fileUrl = searchParams.get('url');

  if (!fileUrl) {
    return NextResponse.json({ message: 'URL is required' }, { status: 400 });
  }

  try {
    // Extract key from URL
    // Format: https://bucket-name.s3.region.amazonaws.com/folder/file.pdf
    // We want "folder/file.pdf"
    
    let key = fileUrl;
    try {
        const urlObj = new URL(fileUrl);
        // Pathname starts with /, so we remove it to get the S3 key
        if (urlObj.pathname.startsWith('/')) {
            key = urlObj.pathname.substring(1); 
        } else {
            key = urlObj.pathname;
        }
    } catch (e) {
        // If fileUrl is not a valid URL, assume it might be the key itself or handle error
        console.warn('Provided URL is not a valid URL object, treating as key or relative path:', fileUrl);
    }
    
    // Validate key is not empty
    if (!key) {
         return NextResponse.json({ message: 'Invalid file key extracted' }, { status: 400 });
    }

    const signedUrl = await getSignedFileUrl(key);

    return NextResponse.redirect(signedUrl);
  } catch (error) {
    console.error('Error generating signed URL:', error);
    return NextResponse.json({ message: 'Error generating signed URL' }, { status: 500 });
  }
}
