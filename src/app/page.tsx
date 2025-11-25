'use client';

import { useState, FC, SVGProps } from 'react';
import { useRouter } from 'next/navigation';
import { FaCar, FaHeartbeat, FaUsers, FaShieldAlt, FaPaw, FaStethoscope, FaPiggyBank } from 'react-icons/fa';
import AseguradorasSection from '@/components/home/AseguradorasSection';
import BeneficiosSection from '@/components/home/BeneficiosSection';
import TestimoniosSection from '@/components/home/TestimoniosSection';
import NoticiasSection from '@/components/home/NoticiasSection';
import FadeIn from '@/components/animation/FadeIn';
import styles from './page.module.css';

const quoteTypes = [
  { key: 'vehiculo', label: 'Vehículo', icon: FaCar },
  { key: 'salud', label: 'Salud', icon: FaHeartbeat },
  { key: 'vida', label: 'Vida', icon: FaUsers },
  { key: 'soat', label: 'SOAT', icon: FaShieldAlt },
  { key: 'mascotas', label: 'Mascotas', icon: FaPaw },
  { key: 'cirugia', label: 'Cirugía', icon: FaStethoscope },
  { key: 'financiacion', label: 'Financiación', icon: FaPiggyBank },
];

const quoteConfig: {[key: string]: any} = {
  vehiculo: {
    title: 'Cotiza tu Seguro en Segundos',
    description: 'Encuentra el seguro ideal para tu vehículo. Compara precios y coberturas de las mejores aseguradoras.',
    label: 'Ingresa la placa de tu vehículo',
    placeholder: 'EJ: ABC-123',
    param: 'placa',
    route: '/cotizacion/vehiculo/confirmar',
  },
  salud: {
    title: 'Las mejores opciones para tu bienestar',
    description: 'Descubre las mejores opciones en pólizas de salud, medicina prepagada y otros planes para tu bienestar.',
    label: 'Ingresa tu número de documento',
    placeholder: 'EJ: 123456789',
    param: 'documento',
    route: '/cotizacion/salud/confirmar',
  },
  vida: {
    title: 'Protege el futuro de los que más quieres',
    description: 'Asegura la tranquilidad de tu familia con un seguro de vida adaptado a tus necesidades.',
    label: 'Ingresa tu número de documento',
    placeholder: 'EJ: 123456789',
    param: 'documento',
    route: '/cotizacion/vida/confirmar',
  },
  soat: {
    title: 'Tu SOAT, rápido y sin complicaciones',
    description: 'Compra tu SOAT obligatorio de forma fácil y rápida con nosotros.',
    label: 'Ingresa la placa de tu vehículo',
    placeholder: 'EJ: ABC-123',
    param: 'placa',
    route: '/cotizacion/vehiculo/confirmar',
  },
  mascotas: {
    title: 'El mejor cuidado para tu mejor amigo',
    description: 'Protege a tu mascota con un seguro que cubre desde consultas hasta emergencias.',
    label: 'Ingresa tu número de documento',
    placeholder: 'EJ: 123456789',
    param: 'documento',
    route: '/cotizacion/mascotas/confirmar',
  },
  cirugia: {
    title: 'Tranquilidad ante imprevistos quirúrgicos',
    description: 'Cobertura para complicaciones en procedimientos quirúrgicos, para que solo te preocupes por tu recuperación.',
    label: 'Ingresa tu número de documento',
    placeholder: 'EJ: 123456789',
    param: 'documento',
    route: '/cotizacion/cirugia/cotizar',
  },
  financiacion: {
    title: 'Financia el vehículo de tus sueños',
    description: 'Te ayudamos a encontrar la mejor opción de financiación para que estrenes vehículo.',
    label: 'Ingresa tu número de documento',
    placeholder: 'EJ: 123456789',
    param: 'documento',
    route: '/cotizacion/financiacion/confirmar',
  },
};

export default function Home() {
  const [tipoCotizacion, setTipoCotizacion] = useState<string | null>(null);
  const [valor, setValor] = useState('');
  const router = useRouter();

  const handleCotizar = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Esta funcionalidad estará disponible próximamente.');
    console.log('Intento de cotización:', { tipoCotizacion, valor });
  };

  const currentConfig = tipoCotizacion ? quoteConfig[tipoCotizacion] : null;

  return (
    <>
      <section className={styles.hero}>
        <div className={styles.container}>
          <div className={styles.items_center_lg_flex}>
            <div className={styles.w_full_lg_w_3_10}>
              <div className={styles.lg_max_w_lg}>
                {currentConfig ? (
                  <FadeIn key={tipoCotizacion} duration={0.5}>
                    <h1 className={styles.title}>
                      {currentConfig.title}
                    </h1>
                    <p className={styles.description}>
                      {currentConfig.description}
                    </p>
                  </FadeIn>
                ) : (
                  <FadeIn duration={0.5}>
                    <h1 className={styles.title}>Compara y Elige tu Seguro Ideal</h1>
                    <p className={styles.description}>
                      Selecciona uno de nuestros servicios a la derecha para encontrar la mejor opción para ti. Rápido, fácil y seguro.
                    </p>
                  </FadeIn>
                )}
              </div>
            </div>
            <div className={styles.form_container_wrapper}>
              <FadeIn duration={0.5} delay={0.2} className={styles.w_full}>
                <div className={styles.InsuranceApp}>
                  <div className={styles.quote_types_container}>
                    {quoteTypes.map((type) => {
                      const Icon = type.icon;
                      return (
                        <button
                          key={type.key}
                          type="button"
                          onClick={() => setTipoCotizacion(type.key)}
                          className={`${styles.quote_type_button} ${tipoCotizacion === type.key ? styles.quote_type_button_selected : ''}`}>
                          <Icon className={styles.quote_type_icon} />
                          <span className={styles.quote_type_label}>{type.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  <div className={styles.form_wrapper}>
                    {currentConfig && (
                      <FadeIn key={tipoCotizacion ? tipoCotizacion + 'form' : 'empty'}>
                        <form onSubmit={handleCotizar}>
                          <div className={styles.mb_6}>
                            <label htmlFor="valor-cotizacion" className={styles.form_label}>
                              {currentConfig.label}
                            </label>
                            <input
                              id="valor-cotizacion"
                              type="text" 
                              value={valor}
                              onChange={(e) => setValor(e.target.value.toUpperCase())}
                              placeholder={currentConfig.placeholder}
                              className={styles.form_input}
                              required
                            />
                          </div>

                          <button
                            type="submit"
                            className={styles.submit_button}>
                            Cotizar Ahora
                          </button>
                          <div className={styles.terms_container}>
                            <input type="checkbox" id="terminos" name="terminos" className={styles.terms_checkbox} required />
                            <label htmlFor="terminos" className={styles.terms_label}>
                              Acepto los <a href="/terminos" className={styles.terms_link}>Términos y Condiciones</a> y la <a href="/politica-de-datos" className={styles.terms_link}>Política de Manejo de Datos</a>.
                            </label>
                          </div>
                        </form>
                      </FadeIn>
                    )}
                  </div>
                </div>
              </FadeIn>
            </div>
          </div>
        </div>
      </section>

      <AseguradorasSection />
      <BeneficiosSection />
      <TestimoniosSection />
      <NoticiasSection />
    </>
  );
}