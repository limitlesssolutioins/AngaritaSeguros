'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, FormEvent } from 'react';
import CotizacionSkeleton from '@/components/ui/CotizacionSkeleton';
import FadeIn from '@/components/animation/FadeIn';

interface PolizaMascota {
  aseguradora: string;
  logo: string;
  plan: string;
  coberturaEmergencias: number;
  coberturaConsultas: number;
  valorMensual: number;
  beneficiosAdicionales: string[];
}

export default function CotizarMascotaClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const documento = searchParams.get('documento');

  // Pet form state
  const [nombreMascota, setNombreMascota] = useState('');
  const [especie, setEspecie] = useState('perro');
  const [raza, setRaza] = useState('');
  const [edad, setEdad] = useState('');

  const [poliza, setPoliza] = useState<PolizaMascota | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formSubmitted, setFormSubmitted] = useState(false);

  const handleCotizarMascota = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setPoliza(null);
    setFormSubmitted(true);

    try {
      const res = await fetch(`/api/cotizar-mascotas?especie=${especie}&edad=${edad}`);
      if (!res.ok) {
        throw new Error('Error al obtener la cotización para tu mascota.');
      }
      const data = await res.json();
      setPoliza(data[0]); // The API returns an array with one item
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerDetalle = () => {
    if (poliza) {
        const polizaData = encodeURIComponent(JSON.stringify(poliza));
        router.push(`/cotizacion/mascotas/detalle?data=${polizaData}`);
    }
  };

  return (
    <div className="bg-gray-50 py-12 min-h-[70vh]">
      <div className="container mx-auto px-6 max-w-4xl">
        <FadeIn>
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h1 className="text-3xl font-bold text-brand-blue text-center mb-6">Cotiza el Seguro para tu Mascota</h1>
            <p className="text-center text-brand-gray mb-8">Ingresa los datos de tu compañero fiel para encontrar el mejor plan de protección.</p>
            
            <form onSubmit={handleCotizarMascota} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="nombreMascota" className="block text-brand-gray text-sm font-bold mb-2">Nombre de tu mascota</label>
                <input id="nombreMascota" type="text" value={nombreMascota} onChange={(e) => setNombreMascota(e.target.value)} placeholder="Ej: Firulais" className="w-full px-4 py-3 text-brand-gray bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue" required />
              </div>
              <div>
                <label htmlFor="especie" className="block text-brand-gray text-sm font-bold mb-2">Especie</label>
                <select id="especie" value={especie} onChange={(e) => setEspecie(e.target.value)} className="w-full px-4 py-3 text-brand-gray bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue" required>
                    <option value="perro">Perro</option>
                    <option value="gato">Gato</option>
                </select>
              </div>
              <div>
                <label htmlFor="raza" className="block text-brand-gray text-sm font-bold mb-2">Raza</label>
                <input id="raza" type="text" value={raza} onChange={(e) => setRaza(e.target.value)} placeholder="Ej: Labrador" className="w-full px-4 py-3 text-brand-gray bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue" required />
              </div>
              <div>
                <label htmlFor="edad" className="block text-brand-gray text-sm font-bold mb-2">Edad (años)</label>
                <input id="edad" type="number" value={edad} onChange={(e) => setEdad(e.target.value)} placeholder="Ej: 3" className="w-full px-4 py-3 text-brand-gray bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue" required />
              </div>
              <div className="md:col-span-2 mt-4">
                <button type="submit" disabled={loading} className="w-full bg-brand-blue hover:bg-opacity-90 text-white font-bold py-3 px-4 rounded-lg text-lg transition-colors focus:outline-none focus:ring-2 focus:ring-brand-blue focus:ring-offset-2 disabled:bg-gray-400">
                  {loading ? 'Buscando Plan...' : 'Ver Plan de Seguro'}
                </button>
              </div>
            </form>
          </div>
        </FadeIn>

        {loading && <CotizacionSkeleton />}

        {error && (
          <div className="text-center p-8 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            <p className="text-xl font-bold mb-4">Error:</p>
            <p>{error}</p>
          </div>
        )}

        {formSubmitted && !loading && !error && poliza && (
            <FadeIn>
                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 hover:border-brand-blue transition relative flex flex-col h-full max-w-md mx-auto">
                  <div className="flex-grow">
                    <div className="flex items-center mb-4">
                        <img src={poliza.logo} alt={`${poliza.aseguradora} logo`} className="h-10 mr-4" />
                        <h2 className="text-2xl font-bold text-brand-blue">{poliza.aseguradora}</h2>
                    </div>
                    <p className="text-xl font-semibold text-brand-gray mb-2">Plan: {poliza.plan}</p>
                    <p className="text-3xl font-extrabold text-brand-blue mb-4">
                        ${poliza.valorMensual.toLocaleString('es-CO')} <span className="text-lg font-medium text-gray-500">/ mes</span>
                    </p>
                    <div className="text-brand-gray mb-4">
                        <p><strong>Cobertura de Emergencias:</strong> ${poliza.coberturaEmergencias.toLocaleString('es-CO')}</p>
                        <p><strong>Consultas Veterinarias:</strong> ${poliza.coberturaConsultas.toLocaleString('es-CO')}</p>
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
                  <button onClick={handleVerDetalle} className="w-full mt-auto bg-brand-blue text-white font-bold py-3 px-4 rounded-lg hover:bg-opacity-90 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-blue focus:ring-offset-2">
                    Ver Detalle y Adquirir
                  </button>
                </div>
            </FadeIn>
        )}
      </div>
    </div>
  );
}