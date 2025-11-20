
import type { Metadata } from 'next';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Contacto - Angarita Seguros',
  description: 'Ponte en contacto con nosotros. Estamos listos para asesorarte y resolver todas tus dudas sobre nuestros seguros.',
};

const ContactoPage = () => {
  return (
    <div className={styles.page}>
      <section className={styles.container}>
        <div className={styles.text_center}>
          <h1 className={styles.title}>Ponte en Contacto</h1>
          <p className={styles.subtitle}>
            ¿Tienes alguna pregunta o necesitas una asesoría personalizada? Completa el formulario y uno de nuestros expertos se comunicará contigo.
          </p>
        </div>

        <div className={styles.contact_form_container}>
          {/* Información de Contacto */}
          <div className={styles.info_container}>
            <h2 className={styles.info_title}>Información</h2>
            <div className={styles.info_items}>
              <p className={styles.info_item}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                <span>Barranquilla, Colombia</span>
              </p>
              <p className={styles.info_item}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                <span>contacto@angaritaseguros.com</span>
              </p>
              <p className={styles.info_item}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                <span>+57 300 123 4567</span>
              </p>
            </div>
          </div>

          {/* Formulario */}
          <div className={styles.form_container}>
            <form className={styles.form}>
              <div className={`${styles.form_group} ${styles.form_group_half}`}>
                <label className={styles.form_label} htmlFor="grid-first-name">
                  Nombre
                </label>
                <input className={styles.form_input} id="grid-first-name" type="text" placeholder="Jane" />
              </div>
              <div className={`${styles.form_group} ${styles.form_group_half}`}>
                <label className={styles.form_label} htmlFor="grid-last-name">
                  Apellido
                </label>
                <input className={styles.form_input} id="grid-last-name" type="text" placeholder="Doe" />
              </div>
              <div className={styles.form_group}>
                <label className={styles.form_label} htmlFor="grid-email">
                  Email
                </label>
                <input className={styles.form_input} id="grid-email" type="email" placeholder="email@example.com" />
              </div>
              <div className={styles.form_group}>
                <label className={styles.form_label} htmlFor="grid-message">
                  Mensaje
                </label>
                <textarea className={`${styles.form_input} ${styles.form_textarea}`} id="grid-message"></textarea>
              </div>
              <div className={styles.form_group}>
                <button className={styles.submit_button} type="button">
                  Enviar Mensaje
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactoPage;
