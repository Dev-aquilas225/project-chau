import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useProducts } from './hooks';
import { ProductCard } from '@/components/ProductCard';
import { Spinner } from '@/components/ui/Spinner';

export function HomePage() {
  const { data: weLove, isLoading } = useProducts({ sort: 'recent' });
  const featured = weLove?.filter((p) => p.weLove).slice(0, 8) ?? [];
  const recent = weLove?.slice(0, 8) ?? [];

  return (
    <div>
      {/* Hero */}
      <section className="border-b border-line bg-gray-50">
        <div className="container-app py-12 text-center md:py-20">
          <h1 className="text-3xl md:text-5xl">La mode de luxe, en seconde main</h1>
          <p className="mx-auto mt-4 max-w-xl text-muted">
            Achetez et vendez des pièces d'exception authentifiées. Mode circulaire, prix accessibles.
          </p>
          <Link to="/catalogue" className="btn-primary mt-6">Découvrir le catalogue</Link>
        </div>
      </section>

      {/* Coups de cœur */}
      <section className="container-app py-10">
        <div className="mb-4 flex items-end justify-between">
          <h2 className="text-2xl">Nos coups de cœur</h2>
          <Link to="/catalogue" className="flex items-center gap-1 text-sm hover:underline">
            Voir plus <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        {isLoading ? (
          <div className="flex justify-center py-10"><Spinner /></div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
            {featured.map((p) => (
              <div key={p.id} className="w-44 shrink-0 md:w-56">
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Nouveautés */}
      <section className="container-app py-6">
        <h2 className="mb-4 text-2xl">Nouveautés</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {recent.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
        <div className="mt-8 flex justify-center">
          <Link to="/catalogue" className="btn-outline">Voir plus</Link>
        </div>
      </section>

      {/* Le Journal (éditorial) */}
      <section className="container-app py-10">
        <h2 className="mb-4 text-2xl">Le Journal</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {[
            { t: 'From Screen to Closet', d: 'Les looks de la nouvelle émission mode.', tag: 'Histoires de mode' },
            { t: 'Vintage Icons', d: 'Les pièces signatures qui traversent les décennies.', tag: 'Histoires de mode' },
          ].map((a) => (
            <article key={a.t} className="overflow-hidden rounded-lg border border-line">
              <div className="aspect-[16/9] bg-gray-100" />
              <div className="p-4">
                <span className="badge">{a.tag}</span>
                <h3 className="mt-2 text-lg">{a.t}</h3>
                <p className="text-sm text-muted">{a.d}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
