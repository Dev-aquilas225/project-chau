import { Outlet, useLocation } from 'react-router-dom';

/**
 * Applique une légère animation d'entrée (fade + slide) à chaque changement de route.
 * La clé basée sur le pathname force le remount de l'Outlet, ce qui relance l'animation CSS.
 */
export function PageTransition() {
  const location = useLocation();
  return (
    <div key={location.pathname} className="animate-page-in">
      <Outlet />
    </div>
  );
}
