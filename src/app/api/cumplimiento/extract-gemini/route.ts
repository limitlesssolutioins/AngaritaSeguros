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
            Extrae la siguiente información de este documento de póliza de seguro y devuélvela en formato JSON.
            El JSON debe tener las siguientes claves:
            - "numeroPoliza" (string)
            - "titularPoliza" (string)
            - "fechaExpedicion" (string en formato YYYY-MM-DD)
            - "fechaInicioVigencia" (string en formato YYYY-MM-DD)
            - "fechaTerminacionVigencia" (string en formato YYYY-MM-DD)
            - "valorPrimaNeta" (número, sin comas ni puntos para miles)
            - "valorTotalAPagar" (número, sin comas ni puntos para miles)
            - "numeroAnexos" (número)
            - "tipoAmparo" (string, el tipo de amparo principal, ej: "Seriedad de oferta" o "Cumplimiento")
            - "aseguradora" (string)
            - "etiqueta" (string, que debe ser el mismo valor que titularPoliza)
            
            Si la póliza incluye cobertura de "Responsabilidad Civil Extracontractual" (a veces abreviado como RCE), incluye los campos "hasRCE" (booleano), "numeroRCE" (string) y "valorRCE" (número). Si no lo incluye, establece "hasRCE" en false.
            
            Analiza el documento completo para encontrar todos los campos. Presta especial atención a los valores numéricos y las fechas en el formato especificado.

            Asegúrate de que el resultado sea únicamente el objeto JSON válido, sin ningún otro texto o formato como 'json'.
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
