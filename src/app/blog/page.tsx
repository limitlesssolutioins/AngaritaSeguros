
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Blog - Angarita Seguros',
  description: 'Mantente informado con las últimas noticias, consejos y guías sobre el mundo de los seguros en Colombia.',
};

const BlogPage = () => {
  const posts = [
    {
      id: 1,
      titulo: '5 Mitos Comunes sobre el Seguro de Automóvil',
      resumen: 'Desmentimos las creencias populares más extendidas para que tomes decisiones informadas sobre tu póliza de vehículo.',
      fecha: 'Julio 15, 2025',
      categoria: 'Automóvil',
    },
    {
      id: 2,
      titulo: '¿Por qué un Seguro de Vida es la mejor inversión para tu futuro?',
      resumen: 'Más allá de una protección, el seguro de vida es una herramienta financiera poderosa. Te explicamos por qué.',
      fecha: 'Julio 10, 2025',
      categoria: 'Vida',
    },
    {
      id: 3,
      titulo: 'Guía Completa para Entender tu Póliza de Hogar',
      resumen: '¿Sabes qué cubre exactamente tu seguro de hogar? Te ayudamos a descifrar cada cláusula y cobertura.',
      fecha: 'Julio 5, 2025',
      categoria: 'Hogar',
    },
  ];

  return (
    <div className="bg-white">
      <section className="container mx-auto px-6 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-neutral-800 mb-4">Nuestro Blog</h1>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            Consejos, guías y noticias del sector asegurador para ayudarte a tomar las mejores decisiones.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
          {posts.map((post) => (
            <div key={post.id} className="bg-neutral-50 rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <div className="p-6">
                <span className="text-sm text-primary font-semibold bg-primary-light px-2 py-1 rounded-full">{post.categoria}</span>
                <h3 className="text-xl font-semibold text-neutral-800 mt-4 mb-2 h-16">{post.titulo}</h3>
                <p className="text-neutral-600 mb-4 h-24">{post.resumen}</p>
                <div className="flex justify-between items-center text-sm text-neutral-500">
                  <span>{post.fecha}</span>
                  <Link href={`/blog/${post.id}`} className="text-primary hover:underline font-medium">
                    Leer más →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default BlogPage;
