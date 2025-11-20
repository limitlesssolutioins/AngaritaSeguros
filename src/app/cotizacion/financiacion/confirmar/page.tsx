'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import FadeIn from '@/components/animation/FadeIn';

interface PersonaData {
  documento: string;
  nombres: string;
  apellidos: string;
}

export default function ConfirmarPersonaFinanciacionPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const documento = searchParams.get('documento');
  const [persona, setPersona] = useState<PersonaData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (documento) {
      fetch(`/api/persona/${documento}`)
        .then(res => {
          if (!res.ok) {
            throw new Error('Persona no encontrada o error en la consulta.');
          }
          return res.json();
        })
        .then(data => {
          setPersona(data);
          setLoading(false);
        })
        .catch(err => {
          setError(err.message);
          setLoading(false);
        });
    } else {
      setError('No se proporcionó un documento.');
      setLoading(false);
    }
  }, [documento]);

  const handleConfirmar = () => {
    window.open('https://www.surafinancia.com.co/angarita/20900', '_blank');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
            <svg className="animate-spin h-10 w-10 text-primary mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            <p className="text-xl text-neutral-700">Cargando tus datos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-center p-8 bg-error-light border border-error text-error-dark rounded-lg">
          <p className="text-xl font-bold mb-4">Error:</p>
          <p>{error}</p>
          <button onClick={() => router.back()} className="mt-6 bg-error hover:bg-error-dark text-white font-bold py-2 px-4 rounded-lg transition-colors">Volver</button>
        </div>
      </div>
    );
  }

  if (!persona) {
    return null; // Should be handled by error state
  }

  return (
    <div className="bg-neutral-50 py-12 min-h-[70vh]">
      <div className="container mx-auto px-6 max-w-3xl">
        <FadeIn>
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h1 className="text-3xl font-bold text-neutral-800 text-center mb-4">Verifica tus Datos para Continuar</h1>
            <p className="text-center text-neutral-600 mb-8">Estás a un paso de ser redirigido a nuestro portal aliado Sura Financia para completar tu solicitud de crédito.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-lg text-neutral-700 max-w-lg mx-auto">
              <p><strong>Documento:</strong> {persona.documento}</p>
              <p><strong>Nombre:</strong> {persona.nombres} {persona.apellidos}</p>
            </div>

            <div className="mt-10 text-center">
              <p className="text-xl text-neutral-800 mb-6">¿Son correctos estos datos?</p>
              <button
                onClick={handleConfirmar}
                className="bg-primary hover:bg-opacity-90 text-white font-bold py-3 px-8 rounded-lg text-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                Continuar a Sura Financia
              </button>
            </div>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
