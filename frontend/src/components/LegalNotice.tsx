import { ShieldAlert } from 'lucide-react';

const TEXT =
  "Le fait de vendre comme de porter de la contrefaçon est un délit pénal passible d'une peine de 3 ans d'emprisonnement et 300.000 € d'amende, outre la confiscation du bien. Pour mémoire une contrefaçon est un produit qui reproduit un dessin, une marque ou un modèle sans l'autorisation de son auteur.";

/** Mention légale obligatoire (contrefaçon) — texte exact, ne pas reformuler. */
export function LegalNotice({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-start gap-3 rounded-lg border border-amber-300 bg-amber-50 p-4 text-xs leading-relaxed text-amber-900 ${className}`} data-testid="legal-notice-contrefacon">
      <ShieldAlert className="mt-0.5 h-5 w-5 flex-shrink-0" />
      <p>{TEXT}</p>
    </div>
  );
}
