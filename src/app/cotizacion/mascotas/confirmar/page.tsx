'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import FadeIn from '@/components/animation/FadeIn';

interface PersonaData {
  documento: string;
  nombres: string;
  apellidos: string;
  fechaNacimiento: string;
  edad: number;
  genero: string;
}

export default function ConfirmarPersonaMascotaPage() {
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
    if (persona) {
      router.push(`/cotizacion/mascotas/cotizar?documento=${persona.documento}`);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
            <svg className="animate-spin h-10 w-10 text-primary mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            <p className="text-xl text-brand-gray">Cargando datos del propietario...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-center p-8 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          <p className="text-xl font-bold mb-4">Error:</p>
          <p>{error}</p>
          <button onClick={() => router.back()} className="mt-6 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">Volver</button>
        </div>
      </div>
    );
  }

  if (!persona) {
    return null; // Should be handled by error state
  }

  return (
    <div className="bg-gray-50 py-12 min-h-[70vh]">
      <div className="container mx-auto px-6 max-w-3xl">
        <FadeIn>
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h1 className="text-3xl font-bold text-brand-blue text-center mb-8">Confirma tus Datos como Dueño de la Mascota</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-lg text-brand-gray">
              <p><strong>Documento:</strong> {persona.documento}</p>
              <p><strong>Nombres:</strong> {persona.nombres}</p>
              <p><strong>Apellidos:</strong> {persona.apellidos}</p>
            </div>

            <div className="mt-10 text-center">
              <p className="text-xl text-brand-blue mb-6">¿Son correctos estos datos?</p>
              <button
                onClick={handleConfirmar}
                className="bg-brand-blue hover:bg-opacity-90 text-white font-bold py-3 px-8 rounded-lg text-lg transition-colors focus:outline-none focus:ring-2 focus:ring-brand-blue focus:ring-offset-2"
              >
                Sí, Continuar
              </button>
            </div>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
