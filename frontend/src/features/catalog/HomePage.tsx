import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useProducts } from './hooks';
import { ProductCard } from '@/components/ProductCard';
import { Spinner } from '@/components/ui/Spinner';

interface JournalItem {
  tag: string;
  title: string;
  description: string;
}

const JOURNAL_IMAGES = [
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&auto=format&fit=crop',
];

export function HomePage() {
  const { t } = useTranslation('catalog');
  const { data: weLove, isLoading } = useProducts({ sort: 'recent' });
  const featured = weLove?.filter((p) => p.weLove).slice(0, 4) ?? [];
  const recent = weLove?.slice(0, 8) ?? [];
  const journalItems = t('home.journal.items', { returnObjects: true }) as JournalItem[];

  return (
    <div className="bg-white">

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section className="relative bg-luxury-beige overflow-hidden">
        <div className="container-custom min-h-[75vh] flex items-center py-16 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center w-full">

            {/* Left: copy */}
            <div className="z-10 text-center lg:text-left">
              <span className="block text-xs uppercase tracking-[0.3em] text-luxury-gold mb-6 font-semibold">
                Édition Limitée &amp; Authentifiée
              </span>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif mb-8 leading-tight">
                {t('home.hero.title')}<br />
                <span className="italic font-normal">{t('home.hero.subtitle')}</span>
              </h1>
              <p className="text-luxury-muted text-base md:text-lg max-w-md mb-10 leading-relaxed mx-auto lg:mx-0">
                Achetez et vendez des pièces d'exception authentifiées par nos experts.
                L'élégance circulaire au juste prix.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link to="/catalogue" className="btn-primary px-10 py-4">
                  Découvrir le catalogue
                </Link>
                <Link to="/devenir-vendeur" className="btn-outline px-10 py-4">
                  Vendre un article
                </Link>
              </div>
            </div>

            {/* Right: hero visual */}
            <div className="relative hidden lg:block">
              <div className="aspect-[4/5] bg-white shadow-2xl relative overflow-hidden group">
                <img
                  src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=900&auto=format&fit=crop"
                  alt="Mode de luxe de seconde main"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                />
                <div className="absolute inset-0 border-[20px] border-white/20 pointer-events-none" />
              </div>
              <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-luxury-gold/10 -z-10 rounded-full blur-3xl" />
            </div>
          </div>
        </div>
      </section>

      {/* ── Nos coups de cœur ──────────────────────────────────────── */}
      <section className="py-20 md:py-24">
        <div className="container-custom">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="section-title">{t('home.favorites.title')}</h2>
              <p className="section-subtitle mt-2">Une sélection de pièces iconiques</p>
            </div>
            <Link to="/catalogue" className="link-see-more">
              {t('home.favorites.seeMore')}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-16"><Spinner /></div>
          ) : featured.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
              {featured.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          ) : (
            /* Fallback: show recent if no weLove products */
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
              {recent.slice(0, 4).map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </section>

      {/* ── Nouveautés callout ──────────────────────────────────────── */}
      <section className="py-20 bg-luxury-beige border-y border-luxury-gold/10">
        <div className="container-custom text-center">
          <h2 className="section-title mb-6">{t('home.new.title')}</h2>
          <p className="text-luxury-muted max-w-2xl mx-auto mb-10 text-sm md:text-base leading-relaxed">
            Découvrez chaque jour des centaines de nouveaux arrivages authentifiés par nos experts.
            Ne manquez pas la pièce de vos rêves.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 mb-12">
            {recent.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
          <Link to="/catalogue" className="btn-outline inline-flex px-12 py-4">
            {t('home.new.seeMore')}
          </Link>
        </div>
      </section>

      {/* ── Le Journal ─────────────────────────────────────────────── */}
      <section className="py-20 md:py-24">
        <div className="container-custom">
          <h2 className="section-title text-center mb-12">{t('home.journal.title')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-12">
            {journalItems.map((a, i) => (
              <article key={a.title} className="group cursor-pointer">
                <div className="aspect-video bg-luxury-beige mb-6 overflow-hidden relative">
                  <img
                    src={JOURNAL_IMAGES[i] ?? JOURNAL_IMAGES[0]}
                    alt={a.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    loading="lazy"
                  />
                  <div className="absolute top-6 left-6">
                    <span className="bg-white/90 text-[10px] uppercase tracking-widest px-4 py-2 font-semibold">
                      {a.tag}
                    </span>
                  </div>
                </div>
                <h3 className="text-xl md:text-2xl font-serif mb-3">{a.title}</h3>
                <p className="text-luxury-muted text-sm leading-relaxed mb-6">{a.description}</p>
                <span className="link-gold">Lire l'article</span>
              </article>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
