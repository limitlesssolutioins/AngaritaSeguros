
'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import CotizacionSkeleton from '@/components/ui/CotizacionSkeleton';

interface Cotizacion {
  aseguradora: string;
  logo: string;
  precio: number;
  beneficios: string[];
  recomendado?: boolean;
}

export default function ResultadosPage() {
  const searchParams = useSearchParams();
  const tipo = searchParams.get('tipo');
  const valor = searchParams.get('valor');
  const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (tipo && valor) {
      setLoading(true);
      fetch(`/api/cotizar?tipo=${tipo}&valor=${valor}`)
        .then((res) => res.json())
        .then((data) => {
          // Marcar la cotización más barata como recomendada
          const masBarata = data.reduce((prev: Cotizacion, current: Cotizacion) => (prev.precio < current.precio) ? prev : current);
          const dataConRecomendado = data.map((cot: Cotizacion) => ({ ...cot, recomendado: cot.aseguradora === masBarata.aseguradora }));
          setCotizaciones(dataConRecomendado);
          setLoading(false);
        });
    }
  }, [tipo, valor]);

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-brand-blue">Resultados de tu Cotización</h1>
          <p className="text-lg text-brand-gray mt-2">
            Compara las mejores ofertas que encontramos para ti.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
          {loading ? (
            <>
              <CotizacionSkeleton />
              <CotizacionSkeleton />
              <CotizacionSkeleton />
            </>
          ) : (
            cotizaciones.map((cot) => (
              <div key={cot.aseguradora} className={`bg-white rounded-xl shadow-lg p-6 border transition-all duration-300 ${cot.recomendado ? 'border-2 border-brand-blue scale-105' : 'border-gray-200'}`}>
                {cot.recomendado && (
                  <div className="absolute -top-4 right-4 bg-brand-blue text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">RECOMENDADO</div>
                )}
                <div className="flex items-center mb-5">
                  <img src={cot.logo} alt={`${cot.aseguradora} logo`} className="h-10 mr-4"/>
                  <h2 className="text-2xl font-bold text-brand-blue">{cot.aseguradora}</h2>
                </div>
                <p className="text-4xl font-extrabold text-brand-blue mb-4">
                  ${cot.precio.toLocaleString('es-CO')} <span className="text-lg font-medium text-gray-500">/ año</span>
                </p>
                <ul className="space-y-3 text-brand-gray mb-8">
                  {cot.beneficios.map((b, i) => (
                    <li key={i} className="flex items-center">
                      <svg className="w-5 h-5 text-brand-orange mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
                <button className={`w-full font-bold py-3 px-4 rounded-lg transition-colors ${cot.recomendado ? 'bg-brand-blue text-white hover:bg-opacity-90' : 'bg-gray-200 text-brand-gray hover:bg-gray-300'}`}>
                  Adquirir Póliza
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
