import { NextResponse } from 'next/server';
import { deleteFileFromS3 } from '@/lib/s3';
import { pool } from '@/lib/db';

export async function POST(request: Request) {
    try {
        const { fileUrl, policyId, type } = await request.json();

        if (!fileUrl || !policyId || !type) {
            return NextResponse.json({ message: 'URL del archivo, ID de póliza y tipo son requeridos' }, { status: 400 });
        }

        // Extract key from URL
        let key = fileUrl;
        try {
            const urlObj = new URL(fileUrl);
            if (urlObj.pathname.startsWith('/')) {
                key = urlObj.pathname.substring(1); 
            } else {
                key = urlObj.pathname;
            }
        } catch (e) {
            console.warn('Invalid URL, treating as key:', fileUrl);
        }

        // Delete from S3
        try {
            await deleteFileFromS3(key);
        } catch (s3Error) {
            console.error('Error deleting from S3:', s3Error);
            // We continue to remove it from DB even if S3 fails, or should we stop?
            // If S3 fails, we might have a ghost file. 
            // If we remove from DB, we lose reference to clean it later.
            // But if we error, user is stuck.
            // Let's log and proceed, as strict consistency might be less important than user flow here.
        }

        // Update Database
        let tableName = '';
        if (type === 'cumplimiento') {
            tableName = 'Policy';
        } else if (type === 'general') {
            tableName = 'GeneralPolicy';
        } else {
            return NextResponse.json({ message: 'Tipo de póliza no válido' }, { status: 400 });
        }

        const [rows]: [any[], any] = await pool.query(`SELECT files FROM ${tableName} WHERE id = ?`, [policyId]);

        if (rows.length === 0) {
            return NextResponse.json({ message: 'Póliza no encontrada' }, { status: 404 });
        }

        const currentFiles: string[] = JSON.parse(rows[0].files || '[]');
        const updatedFiles = currentFiles.filter(f => f !== fileUrl);

        await pool.query(`UPDATE ${tableName} SET files = ? WHERE id = ?`, [JSON.stringify(updatedFiles), policyId]);

        return NextResponse.json({ message: 'Archivo eliminado exitosamente' }, { status: 200 });

    } catch (error) {
        console.error('Error deleting file:', error);
        return NextResponse.json({ message: 'Error interno del servidor al eliminar el archivo' }, { status: 500 });
    }
}
