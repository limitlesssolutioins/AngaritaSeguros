'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import CotizacionSkeleton from '@/components/ui/CotizacionSkeleton';
import FadeIn from '@/components/animation/FadeIn';

interface PolizaSalud {
  aseguradora: string;
  logo: string;
  plan: string;
  coberturaHospitalaria: string;
  coberturaAmbulatoria: string;
  valorTotal: number;
  beneficiosAdicionales: string[];
}

export default function CotizarSaludClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const documento = searchParams.get('documento');
  const edadParam = searchParams.get('edad');

  const [edad, setEdad] = useState(edadParam || '');
  const [condicionesPreexistentes, setCondicionesPreexistentes] = useState(false);
  const [polizas, setPolizas] = useState<PolizaSalud[]>([]);
  const [loading, setLoading] = useState(true); // Start loading initially
  const [error, setError] = useState<string | null>(null);

  const handleCotizarSalud = useCallback(async (preexistentes: boolean) => {
    setLoading(true);
    setError(null);
    setPolizas([]);

    try {
      const res = await fetch(`/api/cotizar-salud?documento=${documento}&edad=${edad}&preexistentes=${preexistentes}`);
      if (!res.ok) {
        throw new Error('Error al obtener cotizaciones de salud.');
      }
      const data = await res.json();
      setPolizas(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [documento, edad]);

  useEffect(() => {
    if (documento && edad) {
      handleCotizarSalud(condicionesPreexistentes);
    }
  }, [documento, edad, condicionesPreexistentes, handleCotizarSalud]);

  const handleVerDetalle = (poliza: PolizaSalud) => {
    const polizaData = encodeURIComponent(JSON.stringify(poliza));
    router.push(`/cotizacion/salud/detalle?data=${polizaData}`);
  };

  return (
    <div className="bg-gray-50 py-12 min-h-[70vh]">
      <div className="container mx-auto px-6">
        <FadeIn>
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-brand-blue text-center mb-6">Planes de Salud Para Ti</h1>
            <p className="text-center text-brand-gray mb-8">Estos son los planes que encontramos según tus datos. Puedes ajustarlos si tienes condiciones médicas preexistentes.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center bg-gray-100 p-4 rounded-lg">
                <div className="md:col-span-1">
                    <label htmlFor="documento" className="block text-brand-gray text-sm font-bold mb-1">Número de Documento</label>
                    <input id="documento" type="text" value={documento || ''} className="w-full px-4 py-2 text-brand-gray bg-gray-200 border rounded-lg" disabled />
                </div>
                <div className="md:col-span-1">
                    <label htmlFor="edad" className="block text-brand-gray text-sm font-bold mb-1">Edad</label>
                    <input id="edad" type="number" value={edad} className="w-full px-4 py-2 text-brand-gray bg-gray-200 border rounded-lg" disabled />
                </div>
                <div className="md:col-span-1 flex items-center justify-center h-full mt-4">
                    <input id="preexistentes" type="checkbox" checked={condicionesPreexistentes} onChange={(e) => setCondicionesPreexistentes(e.target.checked)} className="h-5 w-5 text-brand-blue focus:ring-brand-blue border-gray-300 rounded" />
                    <label htmlFor="preexistentes" className="ml-2 block text-brand-gray font-medium">¿Condiciones preexistentes?</label>
                </div>
            </div>
          </div>
        </FadeIn>

        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <CotizacionSkeleton /><CotizacionSkeleton /><CotizacionSkeleton />
          </div>
        )}

        {error && (
          <div className="text-center p-8 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            <p className="text-xl font-bold mb-4">Error:</p>
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && polizas.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {polizas.map((poliza, index) => (
              <FadeIn key={poliza.aseguradora + poliza.plan} delay={index * 0.1}>
                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 hover:border-brand-blue transition relative flex flex-col h-full">
                  <div className="flex-grow">
                    <div className="flex items-center mb-4">
                        <img src={poliza.logo} alt={`${poliza.aseguradora} logo`} className="h-10 mr-4" />
                        <h2 className="text-2xl font-bold text-brand-blue">{poliza.aseguradora}</h2>
                    </div>
                    <p className="text-xl font-semibold text-brand-gray mb-2">Plan: {poliza.plan}</p>
                    <p className="text-3xl font-extrabold text-brand-blue mb-4">
                        ${poliza.valorTotal.toLocaleString('es-CO')} <span className="text-lg font-medium text-gray-500">/ mes</span>
                    </p>
                    <div className="text-brand-gray mb-4">
                        <p><strong>Cobertura Hospitalaria:</strong> {poliza.coberturaHospitalaria}</p>
                        <p><strong>Cobertura Ambulatoria:</strong> {poliza.coberturaAmbulatoria}</p>
                    </div>
                    <ul className="space-y-2 text-brand-gray mb-6">
                        {poliza.beneficiosAdicionales.map((b, i) => (
                        <li key={i} className="flex items-center">
                            <svg className="w-5 h-5 text-brand-orange mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                            <span>{b}</span>
                        </li>
                        ))}
                    </ul>
                  </div>
                  <button onClick={() => handleVerDetalle(poliza)} className="w-full mt-auto bg-brand-blue text-white font-bold py-3 px-4 rounded-lg hover:bg-opacity-90 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-blue focus:ring-offset-2">
                    Ver Detalle y Adquirir
                  </button>
                </div>
              </FadeIn>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}