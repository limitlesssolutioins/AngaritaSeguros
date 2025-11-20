
'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import CotizacionSkeleton from '@/components/ui/CotizacionSkeleton';
import FadeIn from '@/components/animation/FadeIn';

interface Poliza {
  aseguradora: string;
  logo: string;
  tipoSeguro: string; // Ej: Básico, Full, Premium
  valorDanioTerceros: number; // Ej: 1000000000
  porcentajePerdidaTotal: number; // Ej: 100
  valorTotal: number; // Valor total de la póliza
  beneficiosAdicionales: string[];
}

import styles from './CotizarVehiculoPage.module.css';

export default function CotizarVehiculoPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const placa = searchParams.get('placa');
  const [polizas, setPolizas] = useState<Poliza[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (placa) {
      setLoading(true);
      setError(null);

      fetch(`/api/cotizar?tipo=vehiculo&valor=${placa}`)
        .then(res => {
          if (!res.ok) {
            throw new Error('Error al obtener cotizaciones de vehículo.');
          }
          return res.json();
        })
        .then(data => {
          setPolizas(data);
          setLoading(false);
        })
        .catch(err => {
          setError(err.message);
          setLoading(false);
        });

    } else {
      setError('No se proporcionó una placa para cotizar.');
      setLoading(false);
    }
  }, [placa]);

  const handleVerDetalle = (poliza: Poliza) => {
    // Redirigir a la página de detalle de la póliza, pasando los datos necesarios
    const polizaData = encodeURIComponent(JSON.stringify(poliza));
    router.push(`/cotizacion/vehiculo/detalle?data=${polizaData}`);
  };

  if (loading) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.container}>
          <div className={`${styles.textCenter} ${styles.mb10}`}>
            <h1 className={styles.h1}>Buscando las mejores pólizas para tu vehículo...</h1>
            <p className={styles.p}>Esto puede tomar unos segundos.</p>
          </div>
          <div className={styles.gridContainer}>
            <CotizacionSkeleton />
            <CotizacionSkeleton />
            <CotizacionSkeleton />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorBox}>
          <p className={styles.errorTitle}>Error al cotizar:</p>
          <p>{error}</p>
          <button
            onClick={() => router.back()}
            className={styles.errorButton}
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.mainContentContainer}>
      <div className={styles.container}>
        <div className={`${styles.textCenter} ${styles.mb12}`}>
          <h1 className={styles.mainContentTitle}>Pólizas de Seguro para tu Vehículo</h1>
          <p className={styles.mainContentSubtitle}>
            Compara y elige la mejor opción para tu {placa}.
          </p>
        </div>

        <div className={styles.policyGrid}>
          {polizas.map((poliza, index) => (
            <FadeIn key={poliza.aseguradora + poliza.tipoSeguro} delay={index * 0.1}>
              <div className={styles.policyCard}>
                <div className={styles.policyHeader}>
                  <img src={poliza.logo} alt={`${poliza.aseguradora} logo`} className={styles.policyLogo} />
                  <h2 className={styles.policyAseguradora}>{poliza.aseguradora}</h2>
                </div>
                <p className={styles.policyPlan}>Plan: {poliza.tipoSeguro}</p>
                <p className={styles.policyPrice}>
                  ${poliza.valorTotal.toLocaleString('es-CO')} <span className={styles.policyPriceSpan}>/ año</span>
                </p>
                
                <div className={styles.policyDetails}>
                  <p><strong>Daños a Terceros:</strong> ${poliza.valorDanioTerceros.toLocaleString('es-CO')}</p>
                  <p><strong>Pérdida Total:</strong> {poliza.porcentajePerdidaTotal}%</p>
                </div>

                <ul className={`${styles.policyBenefits} ${styles.spaceY2}`}>
                  {poliza.beneficiosAdicionales.map((b, i) => (
                    <li key={i} className={styles.policyBenefitItem}>
                      <svg className={styles.policyBenefitIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handleVerDetalle(poliza)}
                  className={styles.policyButton}
                >
                  Ver Detalle y Adquirir
                </button>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </div>
  );
}
