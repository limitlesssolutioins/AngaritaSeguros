'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, FormEvent } from 'react';
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

export default function DetallePolizaSaludClient() {
  const searchParams = useSearchParams();
  const [poliza, setPoliza] = useState<PolizaSalud | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');

  useEffect(() => {
    const polizaData = searchParams.get('data');
    if (polizaData) {
      try {
        const decodedData = JSON.parse(decodeURIComponent(polizaData));
        setPoliza(decodedData);
      } catch (e) {
        console.error("Error parsing policy data:", e);
      }
    }
  }, [searchParams]);

  const handleAcquire = async (e: FormEvent) => {
    e.preventDefault();
    if (!nombre || !email || !telefono) {
      alert('Por favor, completa todos los campos.');
      return;
    }
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsSubmitting(false);
    setIsCompleted(true);
  };

  if (!poliza) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <p className="text-xl text-gray-700">Cargando detalle de la póliza de salud...</p>
      </div>
    );
  }

  const totalAPagar = poliza.valorTotal; // Simplified for health insurance

  return (
    <div className="bg-gray-50 py-12 min-h-[70vh]">
      <div className="container mx-auto px-6 max-w-5xl">
        <FadeIn>
          <div className="bg-white rounded-xl shadow-lg p-8 flex flex-col lg:flex-row">
            {/* Columna de Información de la Póliza */}
            <div className="lg:w-2/3 lg:pr-8 mb-8 lg:mb-0">
              <div className="flex items-center mb-6">
                <img src={poliza.logo} alt={`${poliza.aseguradora} logo`} className="h-12 mr-4" />
                <h1 className="text-3xl font-bold text-brand-blue">Plan de Salud {poliza.plan} de {poliza.aseguradora}</h1>
              </div>

              <p className="text-lg text-brand-gray mb-6">
                Este plan de salud te ofrece acceso a una amplia red médica y la tranquilidad de estar cubierto ante cualquier eventualidad.
              </p>

              <h2 className="text-2xl font-bold text-brand-blue mb-4">Coberturas Principales</h2>
              <ul className="space-y-3 text-brand-gray mb-6">
                 <li className="flex items-center">
                  <svg className="w-6 h-6 text-brand-orange mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  <span><strong>Cobertura Hospitalaria:</strong> {poliza.coberturaHospitalaria}</span>
                </li>
                <li className="flex items-center">
                  <svg className="w-6 h-6 text-brand-orange mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  <span><strong>Cobertura Ambulatoria:</strong> {poliza.coberturaAmbulatoria}</span>
                </li>
              </ul>

              <h2 className="text-2xl font-bold text-brand-blue mb-4">Beneficios Adicionales</h2>
              <ul className="space-y-3 text-brand-gray">
                {poliza.beneficiosAdicionales.map((b, i) => (
                  <li key={i} className="flex items-center">
                    <svg className="w-6 h-6 text-brand-blue mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Columna de Resumen y Compra */}
            <div className="lg:w-1/3 bg-gray-100 p-6 rounded-lg shadow-inner">
              {isCompleted ? (
                <div className="text-center">
                    <svg className="w-16 h-16 text-brand-orange mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    <h2 className="text-2xl font-bold text-brand-blue mb-4">¡Proceso Exitoso!</h2>
                    <p className="text-brand-gray">Gracias, {nombre}. Hemos recibido tu solicitud para el plan de salud.</p>
                    <p className="text-brand-gray mt-2">Uno de nuestros asesores se pondrá en contacto contigo al correo <strong>{email}</strong> o al teléfono <strong>{telefono}</strong> para finalizar el proceso.</p>
                </div>
              ) : (
                <form onSubmit={handleAcquire}>
                  <h2 className="text-2xl font-bold text-brand-blue mb-6">Finalizar Adquisición</h2>
                  
                  <div className="space-y-4 mb-6">
                    <div>
                        <label htmlFor="nombre" className="block text-sm font-medium text-brand-gray">Nombre Completo</label>
                        <input type="text" id="nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-blue focus:border-brand-blue" required />
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-brand-gray">Correo Electrónico</label>
                        <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-blue focus:border-brand-blue" required />
                    </div>
                    <div>
                        <label htmlFor="telefono" className="block text-sm font-medium text-brand-gray">Teléfono</label>
                        <input type="tel" id="telefono" value={telefono} onChange={(e) => setTelefono(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-blue focus:border-brand-blue" required />
                    </div>
                  </div>

                  <div className="border-t border-gray-300 pt-3 mt-3 flex justify-between text-xl font-bold text-brand-blue">
                    <span>Total Mensual:</span>
                    <span>${totalAPagar.toLocaleString('es-CO')}</span>
                  </div>

                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full mt-6 bg-brand-orange hover:bg-opacity-90 text-white font-bold py-3 px-4 rounded-lg text-lg transition-colors focus:outline-none focus:ring-2 focus:ring-brand-orange focus:ring-offset-2 disabled:bg-gray-400">
                    {isSubmitting ? 'Procesando...' : 'Adquirir Plan de Salud'}
                  </button>
                  <p className="text-sm text-gray-500 text-center mt-4">Al hacer clic, aceptas los términos y condiciones.</p>
                </form>
              )}
            </div>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}