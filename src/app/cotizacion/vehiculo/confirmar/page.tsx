'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import FadeIn from '@/components/animation/FadeIn';
import styles from './page.module.css';

interface VehiculoData {
  placa: string;
  marca: string;
  linea: string;
  modelo: number;
  cilindraje: number;
  clase: string;
  tipoServicio: string;
  color: string;
  propietario: string;
  identificacionPropietario: string;
}

export default function ConfirmarVehiculoPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const placa = searchParams.get('placa');
  const tipo = searchParams.get('tipo');
  const isSoatFlow = tipo === 'soat';

  const [vehiculo, setVehiculo] = useState<VehiculoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (placa) {
      fetch(`/api/vehiculo/${placa}`)
        .then(res => {
          if (!res.ok) {
            throw new Error('Vehículo no encontrado o error en la consulta.');
          }
          return res.json();
        })
        .then(data => {
          setVehiculo(data);
          setLoading(false);
        })
        .catch(err => {
          setError(err.message);
          setLoading(false);
        });
    } else {
      setError('No se proporcionó una placa.');
      setLoading(false);
    }
  }, [placa]);

  const handleConfirmar = () => {
    if (isSoatFlow) {
        window.open('https://www.segurosmundial.com.co/soat/', '_blank');
    } else if (vehiculo) {
      router.push(`/cotizacion/vehiculo/cotizar?placa=${vehiculo.placa}`);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div>
            <div className={styles.loadingSpinner}></div>
            <p className={styles.loadingText}>Cargando datos del vehículo...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorBox}>
          <p className={styles.errorTitle}>Error:</p>
          <p>{error}</p>
          <button onClick={() => router.back()} className={styles.backButton}>Volver</button>
        </div>
      </div>
    );
  }

  if (!vehiculo) {
    return null; // Should be handled by error state
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.contentWrapper}>
        <FadeIn>
          <div className={styles.card}>
            <h1 className={styles.title}>
                {isSoatFlow ? 'Verifica tu Vehículo para Comprar el SOAT' : 'Confirma los Datos de tu Vehículo'}
            </h1>
            <p className={styles.subtitle}>
                {isSoatFlow ? 'A continuación, serás redirigido al portal de Seguros Mundial para completar la compra de tu SOAT.' : 'Revisa los datos de tu vehículo antes de continuar con la cotización.'}
            </p>
            
            <div className={styles.grid}>
              <p><strong>Placa:</strong> {vehiculo.placa}</p>
              <p><strong>Marca:</strong> {vehiculo.marca}</p>
              <p><strong>Línea:</strong> {vehiculo.linea}</p>
              <p><strong>Modelo:</strong> {vehiculo.modelo}</p>
              <p><strong>Clase:</strong> {vehiculo.clase}</p>
              <p><strong>Servicio:</strong> {vehiculo.tipoServicio}</p>
            </div>

            <div className={styles.confirmationSection}>
              <p className={styles.confirmationText}>¿Son correctos estos datos?</p>
              <button
                onClick={handleConfirmar}
                className={styles.confirmButton}
              >
                {isSoatFlow ? 'Comprar SOAT en Seguros Mundial' : 'Sí, Continuar con la Cotización'}
              </button>
            </div>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}