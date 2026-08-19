import { Header } from './Header';
import { ShippingNoticeBanner } from './ShippingNoticeBanner';
import { BottomNav } from './BottomNav';
import { Footer } from './Footer';
import { PageTransition } from './PageTransition';
import { useFavoritesSync } from '@/features/favorites/sync';

export function Layout() {
  useFavoritesSync();
  return (
    <div className="flex min-h-screen flex-col">
      <ShippingNoticeBanner />
      <Header />
      <main className="flex-1 pb-20 md:pb-0">
        <PageTransition />
      </main>
      <Footer />
      <BottomNav />
    </div>
  );
}
