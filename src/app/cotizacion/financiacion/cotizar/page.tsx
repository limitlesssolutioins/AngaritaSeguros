'use client';

import FadeIn from '@/components/animation/FadeIn';

export default function CotizarFinanciacionPage() {

  return (
    <div className="bg-neutral-50 py-20 min-h-[70vh]">
      <div className="container mx-auto px-6 text-center">
        <FadeIn>
          <div className="bg-white rounded-xl shadow-lg p-12 max-w-2xl mx-auto">
            <h1 className="text-4xl font-bold text-neutral-800 mb-4">
              Financia tu Vehículo
            </h1>
            <p className="text-xl text-neutral-600 mb-8">
              Estamos trabajando para traerte las mejores opciones de financiación.
            </p>
            <div className="animate-pulse">
              <div className="w-32 h-32 mx-auto bg-neutral-200 rounded-full mb-4 flex items-center justify-center">
                <svg className="w-16 h-16 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
              <div className="h-4 bg-neutral-200 rounded w-3/4 mx-auto mb-2"></div>
              <div className="h-4 bg-neutral-200 rounded w-1/2 mx-auto"></div>
            </div>
            <p className="text-lg text-neutral-500 mt-8">
              ¡Vuelve pronto!
            </p>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
