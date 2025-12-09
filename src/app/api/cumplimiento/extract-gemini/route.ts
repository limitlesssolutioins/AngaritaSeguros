import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: NextRequest) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error('Gemini API key is not configured');
        return NextResponse.json({ message: 'Gemini API key is not configured' }, { status: 500 });
    }

    let formData;
    try {
        formData = await req.formData();
    } catch (e) {
        console.error('Error parsing form data:', e);
        return NextResponse.json({ message: 'Error parsing form data' }, { status: 400 });
    }

    const file = formData.get('file') as File;

    if (!file) {
        return NextResponse.json({ message: 'No file uploaded' }, { status: 400 });
    }

    if (file.type !== 'application/pdf') {
        return NextResponse.json({ message: 'File must be a PDF' }, { status: 400 });
    }
    
    try {
        // 1. Read file into a buffer and convert to base64
        const buffer = await file.arrayBuffer();
        const base64File = Buffer.from(buffer).toString('base64');

        // 2. Call Gemini API with the file data
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' }); 

    const prompt = `
      Extract the following information from the provided insurance policy document.
      Return ONLY a raw JSON object (no markdown, no backticks).
      Keys:
      - clientNombreCompleto (Name of the policy holder/tomador)
      - clientNumeroIdentificacion (ID number of the policy holder)
      - tipoIdentificacion (ID type code. MUST be one of: 'CC', 'NIT', 'CE', 'PA')
      - numeroPoliza (Policy number)
      - fechaExpedicion (YYYY-MM-DD)
      - fechaInicioVigencia (YYYY-MM-DD)
      - fechaTerminacionVigencia (YYYY-MM-DD)
      - aseguradora (Name of the insurance company)
      - valorPrimaNeta (Net premium value, number only)
      - valorTotalAPagar (Total value to pay, number only)
      - numeroAnexos (Annex number, default to 0 if not found)
      - tipoPoliza (Type of policy)
    `;

        const filePart = {
            inlineData: {
                data: base64File,
                mimeType: 'application/pdf',
            },
        };

        const result = await model.generateContent([prompt, filePart]);
        const response = await result.response;
        let jsonString = response.text();
        
        console.log("Raw response from Gemini:", jsonString); // Log the raw response

        // Clean the response to ensure it's a valid JSON string
        jsonString = jsonString.replace(/```json/g, '').replace(/```/g, '').trim();

        try {
            const extractedData = JSON.parse(jsonString);
            return NextResponse.json(extractedData);
        } catch (parseError) {
            console.error('Failed to parse JSON from Gemini:', parseError);
            // Return the raw string to the client for debugging
            return NextResponse.json({ 
                message: 'Failed to parse JSON response from Gemini.',
                rawResponse: jsonString 
            }, { status: 500 });
        }

    } catch (error) {
        console.error('Error processing PDF with Gemini:', error);
        let errorMessage = 'An unknown error occurred.';
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        return NextResponse.json({ message: 'Error processing PDF with Gemini', error: errorMessage }, { status: 500 });
    }
}
