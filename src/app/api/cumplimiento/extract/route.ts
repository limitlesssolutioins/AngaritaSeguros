import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs'; // Set runtime to Node.js for compatibility

export async function POST(req: NextRequest) {
  const { pdf } = require('pdf-to-text');
  
  try {
    const data = await req.formData();
    const file: File | null = data.get('file') as unknown as File;

    if (!file) {
      return NextResponse.json({ success: false, message: 'No file uploaded.' }, { status: 400 });
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json({ success: false, message: 'File is not a PDF.' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Use the new pdf-to-text library, wrapped in a Promise
    const text = await new Promise<string>((resolve, reject) => {
      pdf(buffer, (err: any, data?: string) => {
        if (err) {
          return reject(err);
        }
        if (data) {
          return resolve(data);
        }
        // Handle cases where data might be empty
        return resolve('');
      });
    });

    // Return the full raw text for debugging purposes.
    return NextResponse.json({
      success: true,
      debug_text: text,
    }, { status: 200 });

  } catch (error) {
    console.error('[PDF EXTRACTION ERROR]:', error);
    // Ensure a safe, serializable JSON response is always sent.
    const errorMessage = error instanceof Error ? error.message : 'An unknown server error occurred during PDF processing.';
    return NextResponse.json({ success: false, message: errorMessage }, { status: 500 });
  }
}
