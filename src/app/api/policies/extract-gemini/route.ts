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
            - "aseguradora" (string, el nombre de la compañía de seguros)
            - "ramo" (string, el tipo de seguro, ej: "Automóviles", "Vida", "Salud", "Hogar")
            - "numeroPoliza" (string)
            - "fechaExpedicion" (string en formato YYYY-MM-DD)
            - "fechaInicio" (string en formato YYYY-MM-DD, a menudo llamada "desde las...")
            - "fechaFinVigencia" (string en formato YYYY-MM-DD, a menudo llamada "hasta las...")
            - "placa" (string, si el ramo es "Automóviles", de lo contrario dejar como string vacío "")
            - "valorPrimaNeta" (número, sin comas ni puntos para miles)
            - "valorTotalAPagar" (número, sin comas ni puntos para miles)
            - "financiado" (booleano, true si la póliza indica que es financiada, de lo contrario false)
            - "financiera" (string, si es financiado, el nombre de la entidad financiera, de lo contrario string vacío "")
            - "clientNombreCompleto" (string, el nombre del cliente o empresa tomador de la póliza)
            - "clientTipoIdentificacion" (string, ej: "NIT" o "CC")
            - "clientNumeroIdentificacion" (string, el número de identificación del tomador)
            
            Analiza el documento completo para encontrar todos los campos. Presta especial atención a los valores numéricos y las fechas.
            Si un campo no aplica (por ejemplo, 'placa' en una póliza de vida), déjalo como un string vacío o el valor por defecto apropiado.

            Asegúrate de que el resultado sea únicamente el objeto JSON válido, sin ningún otro texto o formato como 'json'.
        `;

        const filePart = {
            inlineData: {
                data: base64File,
                mimeType: 'application/pdf',
            },
        };

        let result;
        let retryCount = 0;
        const maxRetries = 3;
        
        while (true) {
            try {
                result = await model.generateContent([prompt, filePart]);
                break;
            } catch (error: any) {
                retryCount++;
                const isOverloaded = error.message?.includes('503') || error.toString().includes('503');
                
                if (isOverloaded && retryCount <= maxRetries) {
                    console.warn(`Gemini model overloaded (503), retrying attempt ${retryCount}/${maxRetries}...`);
                    // Exponential backoff: 2s, 4s, 8s
                    await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retryCount)));
                } else {
                    throw error;
                }
            }
        }

        const response = await result.response;
        let jsonString = response.text();
        
        console.log("Raw response from Gemini for General Policy:", jsonString); // Log the raw response

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
