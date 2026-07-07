import { MigrationInterface, QueryRunner } from 'typeorm';

const ROOT: Array<[name: string, slug: string]> = [
  ['Femme', 'femme'],
  ['Homme', 'homme'],
  ['Enfant', 'enfant'],
];

const LEVEL2: Array<[name: string, slug: string, parentSlug: string]> = [
  ['Sacs', 'femme-sacs', 'femme'],
  ['Vêtements', 'femme-vetements', 'femme'],
  ['Chaussures', 'femme-chaussures', 'femme'],
  ['Accessoires', 'femme-accessoires', 'femme'],
  ['Bijoux', 'femme-bijoux', 'femme'],
  ['Montres', 'femme-montres', 'femme'],
  ['Beauté', 'femme-beaute', 'femme'],

  ['Vêtements', 'homme-vetements', 'homme'],
  ['Chaussures', 'homme-chaussures', 'homme'],
  ['Sacs', 'homme-sacs', 'homme'],
  ['Accessoires', 'homme-accessoires', 'homme'],
  ['Bijoux', 'homme-bijoux', 'homme'],
  ['Montres', 'homme-montres', 'homme'],

  ['Fille', 'enfant-fille', 'enfant'],
  ['Garçon', 'enfant-garcon', 'enfant'],
  ['Bébé', 'enfant-bebe', 'enfant'],
];

const LEVEL3: Array<[name: string, slug: string, parentSlug: string]> = [
  // Femme > Sacs
  ['Sacs à main', 'femme-sacs-main', 'femme-sacs'],
  ['Sacs bandoulière', 'femme-sacs-bandouliere', 'femme-sacs'],
  ['Sacs à dos', 'femme-sacs-dos', 'femme-sacs'],
  ['Pochettes', 'femme-sacs-pochettes', 'femme-sacs'],
  ['Cabas', 'femme-sacs-cabas', 'femme-sacs'],
  ['Sacs de voyage', 'femme-sacs-voyage', 'femme-sacs'],
  // Femme > Vêtements
  ['Robes', 'femme-vetements-robes', 'femme-vetements'],
  ['Tops & T-shirts', 'femme-vetements-tops', 'femme-vetements'],
  ['Manteaux & Vestes', 'femme-vetements-manteaux', 'femme-vetements'],
  ['Pulls & Sweats', 'femme-vetements-pulls', 'femme-vetements'],
  ['Pantalons', 'femme-vetements-pantalons', 'femme-vetements'],
  ['Jupes', 'femme-vetements-jupes', 'femme-vetements'],
  ['Jeans', 'femme-vetements-jeans', 'femme-vetements'],
  ['Combinaisons', 'femme-vetements-combinaisons', 'femme-vetements'],
  // Femme > Chaussures
  ['Escarpins', 'femme-chaussures-escarpins', 'femme-chaussures'],
  ['Sandales', 'femme-chaussures-sandales', 'femme-chaussures'],
  ['Baskets', 'femme-chaussures-baskets', 'femme-chaussures'],
  ['Bottes & Bottines', 'femme-chaussures-bottes', 'femme-chaussures'],
  ['Mocassins & Ballerines', 'femme-chaussures-mocassins', 'femme-chaussures'],
  // Femme > Accessoires
  ['Ceintures', 'femme-accessoires-ceintures', 'femme-accessoires'],
  ['Écharpes & Foulards', 'femme-accessoires-echarpes', 'femme-accessoires'],
  ['Lunettes de soleil', 'femme-accessoires-lunettes', 'femme-accessoires'],
  ['Chapeaux & Casquettes', 'femme-accessoires-chapeaux', 'femme-accessoires'],
  ['Gants', 'femme-accessoires-gants', 'femme-accessoires'],
  ['Portefeuilles', 'femme-accessoires-portefeuilles', 'femme-accessoires'],
  // Femme > Bijoux
  ['Colliers', 'femme-bijoux-colliers', 'femme-bijoux'],
  ['Bracelets', 'femme-bijoux-bracelets', 'femme-bijoux'],
  ['Bagues', 'femme-bijoux-bagues', 'femme-bijoux'],
  ["Boucles d'oreilles", 'femme-bijoux-boucles-oreilles', 'femme-bijoux'],
  // Femme > Montres
  ['Montres automatiques', 'femme-montres-automatiques', 'femme-montres'],
  ['Montres à quartz', 'femme-montres-quartz', 'femme-montres'],
  ['Montres connectées', 'femme-montres-connectees', 'femme-montres'],
  // Femme > Beauté
  ['Parfum', 'femme-beaute-parfum', 'femme-beaute'],
  ['Maquillage', 'femme-beaute-maquillage', 'femme-beaute'],
  ['Soin', 'femme-beaute-soin', 'femme-beaute'],

  // Homme > Vêtements
  ['Manteaux & Vestes', 'homme-vetements-manteaux', 'homme-vetements'],
  ['Pulls & Sweats', 'homme-vetements-pulls', 'homme-vetements'],
  ['Chemises', 'homme-vetements-chemises', 'homme-vetements'],
  ['T-shirts & Polos', 'homme-vetements-tshirts', 'homme-vetements'],
  ['Pantalons', 'homme-vetements-pantalons', 'homme-vetements'],
  ['Jeans', 'homme-vetements-jeans', 'homme-vetements'],
  ['Costumes', 'homme-vetements-costumes', 'homme-vetements'],
  // Homme > Chaussures
  ['Baskets', 'homme-chaussures-baskets', 'homme-chaussures'],
  ['Mocassins & Chaussures bateau', 'homme-chaussures-mocassins', 'homme-chaussures'],
  ['Bottes & Bottines', 'homme-chaussures-bottes', 'homme-chaussures'],
  ['Chaussures de ville', 'homme-chaussures-ville', 'homme-chaussures'],
  ['Sandales', 'homme-chaussures-sandales', 'homme-chaussures'],
  // Homme > Sacs
  ['Sacs à dos', 'homme-sacs-dos', 'homme-sacs'],
  ['Sacs bandoulière', 'homme-sacs-bandouliere', 'homme-sacs'],
  ['Porte-documents', 'homme-sacs-porte-documents', 'homme-sacs'],
  ['Sacs de voyage', 'homme-sacs-voyage', 'homme-sacs'],
  // Homme > Accessoires
  ['Ceintures', 'homme-accessoires-ceintures', 'homme-accessoires'],
  ['Portefeuilles', 'homme-accessoires-portefeuilles', 'homme-accessoires'],
  ['Écharpes', 'homme-accessoires-echarpes', 'homme-accessoires'],
  ['Chapeaux & Casquettes', 'homme-accessoires-chapeaux', 'homme-accessoires'],
  ['Lunettes de soleil', 'homme-accessoires-lunettes', 'homme-accessoires'],
  ['Cravates & Nœuds papillon', 'homme-accessoires-cravates', 'homme-accessoires'],
  // Homme > Bijoux
  ['Bracelets', 'homme-bijoux-bracelets', 'homme-bijoux'],
  ['Colliers', 'homme-bijoux-colliers', 'homme-bijoux'],
  ['Boutons de manchette', 'homme-bijoux-boutons-manchette', 'homme-bijoux'],
  // Homme > Montres
  ['Montres automatiques', 'homme-montres-automatiques', 'homme-montres'],
  ['Montres à quartz', 'homme-montres-quartz', 'homme-montres'],
  ['Montres connectées', 'homme-montres-connectees', 'homme-montres'],

  // Enfant > Fille / Garçon / Bébé
  ['Vêtements', 'enfant-fille-vetements', 'enfant-fille'],
  ['Chaussures', 'enfant-fille-chaussures', 'enfant-fille'],
  ['Accessoires', 'enfant-fille-accessoires', 'enfant-fille'],
  ['Vêtements', 'enfant-garcon-vetements', 'enfant-garcon'],
  ['Chaussures', 'enfant-garcon-chaussures', 'enfant-garcon'],
  ['Accessoires', 'enfant-garcon-accessoires', 'enfant-garcon'],
  ['Vêtements', 'enfant-bebe-vetements', 'enfant-bebe'],
  ['Chaussures', 'enfant-bebe-chaussures', 'enfant-bebe'],
  ['Accessoires', 'enfant-bebe-accessoires', 'enfant-bebe'],
];

const ORIGINAL_CATEGORIES: Array<[name: string, slug: string]> = [
  ['Sacs', 'sacs'],
  ['Chaussures', 'chaussures'],
  ['Vêtements', 'vetements'],
  ['Montres & Bijoux', 'montres-bijoux'],
  ['Accessoires', 'accessoires'],
  ['Maroquinerie', 'maroquinerie'],
  ['Lunettes', 'lunettes'],
  ['Parfums', 'parfums'],
];

function sqlString(value: string): string {
  return `'${value.replace(/'/g, "''")}'`;
}

function valuesList(rows: Array<[string, string]>): string {
  return rows.map(([name, slug]) => `(${sqlString(name)}, ${sqlString(slug)})`).join(', ');
}

function valuesListWithParent(rows: Array<[string, string, string]>): string {
  return rows
    .map(([name, slug, parentSlug]) => `(${sqlString(name)}, ${sqlString(slug)}, ${sqlString(parentSlug)})`)
    .join(', ');
}

export class ReplaceCategoriesVestiaireTaxonomy1820000000000 implements MigrationInterface {
  name = 'ReplaceCategoriesVestiaireTaxonomy1820000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // FK products.categoryId -> categories.id est ON DELETE SET NULL : les produits existants
    // deviennent "sans catégorie" plutôt que d'être supprimés.
    await queryRunner.query(`DELETE FROM "categories"`);

    await queryRunner.query(`
      INSERT INTO "categories" ("name", "slug")
      VALUES ${valuesList(ROOT)}
    `);

    await queryRunner.query(`
      INSERT INTO "categories" ("name", "slug", "parentId")
      SELECT v.name, v.slug, p.id
      FROM (VALUES ${valuesListWithParent(LEVEL2)}) AS v(name, slug, "parentSlug")
      JOIN "categories" p ON p.slug = v."parentSlug"
    `);

    await queryRunner.query(`
      INSERT INTO "categories" ("name", "slug", "parentId")
      SELECT v.name, v.slug, p.id
      FROM (VALUES ${valuesListWithParent(LEVEL3)}) AS v(name, slug, "parentSlug")
      JOIN "categories" p ON p.slug = v."parentSlug"
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM "categories"`);
    await queryRunner.query(`
      INSERT INTO "categories" ("name", "slug")
      VALUES ${valuesList(ORIGINAL_CATEGORIES)}
    `);
  }
}
