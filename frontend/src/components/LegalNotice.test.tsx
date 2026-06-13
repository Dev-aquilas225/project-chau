import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LegalNotice } from './LegalNotice';

describe('LegalNotice', () => {
  it('affiche le texte légal exact sur la contrefaçon', () => {
    render(<LegalNotice />);
    const notice = screen.getByTestId('legal-notice-contrefacon');
    expect(notice.textContent).toContain(
      "Le fait de vendre comme de porter de la contrefaçon est un délit pénal passible d'une peine de 3 ans d'emprisonnement et 300.000 € d'amende, outre la confiscation du bien.",
    );
    expect(notice.textContent).toContain(
      "une contrefaçon est un produit qui reproduit un dessin, une marque ou un modèle sans l'autorisation de son auteur.",
    );
  });
});
