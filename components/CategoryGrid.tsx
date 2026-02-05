const categories = [
  { name: "Comida y Bebidas", slug: "comida", icon: "🍽️" },
  { name: "Moda y Accesorios", slug: "moda", icon: "👕" },
  { name: "Regalos y Detalles", slug: "regalos", icon: "🎁" },
  { name: "Hogar y Decoración", slug: "hogar", icon: "🏠" },
  { name: "Servicios", slug: "servicios", icon: "🛠️" },
  { name: "Tecnología", slug: "tecnologia", icon: "📱" },
];

export default function CategoryGrid() {
  return (
    <section className="py-12">
      <h2 className="text-2xl font-bold text-center mb-8">
        Explora por categorías
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        {categories.map((cat) => (
          <a
            key={cat.slug}
            href={`/categoria/${cat.slug}`}
            className="bg-white rounded-xl shadow p-6 text-center font-semibold
                       hover:shadow-lg transition"
          >
            <div className="text-3xl mb-2">{cat.icon}</div>
            {cat.name}
          </a>
        ))}
      </div>
    </section>
  );
}
