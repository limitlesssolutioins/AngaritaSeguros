
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

// Datos de ejemplo (en un futuro, vendrían de una base de datos)
const posts = [
  {
    id: 1,
    titulo: '5 Mitos Comunes sobre el Seguro de Automóvil',
    contenido: `
      <p className="mb-4 text-lg text-neutral-600">En el mundo de los seguros de auto, existen muchas creencias populares que pueden llevar a confusiones. Aquí desmentimos 5 de los mitos más comunes:</p>
      <h3 className="text-2xl font-semibold text-neutral-800 mt-6 mb-3">1. El color del auto afecta el precio del seguro</h3>
      <p className="mb-4 text-neutral-600">Falso. Las aseguradoras se basan en el modelo, año, marca, y historial del conductor, no en el color. Un deportivo rojo no es más caro por ser rojo, sino por ser un deportivo.</p>
      <h3 className="text-2xl font-semibold text-neutral-800 mt-6 mb-3">2. Si un amigo choca mi auto, su seguro paga</h3>
      <p className="mb-4 text-neutral-600">Incorrecto. El seguro sigue al vehículo, no al conductor. Si prestas tu auto, estás prestando tu seguro. Cualquier accidente quedará en tu historial.</p>
      <h3 className="text-2xl font-semibold text-neutral-800 mt-6 mb-3">3. El seguro obligatorio (SOAT) cubre todo</h3>
      <p className="mb-4 text-neutral-600">No. El SOAT solo cubre gastos médicos de los ocupantes y peatones, incapacidad y muerte. No cubre daños al vehículo propio ni a terceros.</p>
      <h3 className="text-2xl font-semibold text-neutral-800 mt-6 mb-3">4. Tener un seguro a todo riesgo es demasiado caro</h3>
      <p className="mb-4 text-neutral-600">No necesariamente. El valor de la tranquilidad que ofrece una cobertura completa suele superar el costo, especialmente si tu auto es nuevo o de alto valor. Cotizar es la clave.</p>
      <h3 className="text-2xl font-semibold text-neutral-800 mt-6 mb-3">5. Las aseguradoras siempre buscan no pagar</h3>
      <p className="mb-4 text-neutral-600">Las aseguradoras son negocios regulados. Si tu reclamación es justa y está dentro de los términos de tu póliza, la aseguradora cumplirá. La clave está en conocer bien tu cobertura.</p>
    `,
    fecha: 'Julio 15, 2025',
    categoria: 'Automóvil',
  },
  // ... otros posts
];

// Función para generar metadatos dinámicos
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const post = posts.find(p => p.id.toString() === params.id);
  if (!post) {
    return {
      title: 'Post no encontrado',
    };
  }
  return {
    title: `${post.titulo} - Angarita Seguros`,
    description: post.contenido.substring(0, 160).replace(/<[^>]*>/g, ''), // Pequeño resumen para SEO
  };
}


const BlogPostPage = ({ params }: { params: { id: string } }) => {
  const post = posts.find(p => p.id.toString() === params.id);

  if (!post) {
    notFound(); // Muestra una página 404 si el post no existe
  }

  return (
    <article className="bg-white py-12">
      <div className="container mx-auto px-6 max-w-3xl">
        <div className="text-center mb-8">
          <span className="text-sm text-primary font-semibold bg-primary-light px-3 py-1 rounded-full">{post.categoria}</span>
          <h1 className="text-4xl font-bold text-neutral-800 mt-4">{post.titulo}</h1>
          <p className="text-neutral-500 mt-2">Publicado el {post.fecha}</p>
        </div>
        
        <div className="prose lg:prose-xl max-w-none mx-auto" dangerouslySetInnerHTML={{ __html: post.contenido }} />

      </div>
    </article>
  );
};

export default BlogPostPage;
