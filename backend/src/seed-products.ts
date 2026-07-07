import { AppDataSource } from './data-source';
import { Category } from './categories/entities/category.entity';
import { Product } from './products/entities/product.entity';
import { User } from './users/entities/user.entity';

const PRODUCTS_PER_LEAF = 3;

const BRAND_POOLS: Record<string, string[]> = {
  Sacs: ['Hermès', 'Chanel', 'Louis Vuitton', 'Gucci', 'Dior', 'Céline', 'Bottega Veneta', 'Saint Laurent', 'Prada', 'Fendi'],
  Vêtements: ['Saint Laurent', 'Gucci', 'Dior', 'Prada', 'Balenciaga', 'Chanel', 'Valentino', 'Burberry', 'Loro Piana', 'Céline'],
  Chaussures: ['Gucci', 'Christian Louboutin', 'Prada', 'Balenciaga', 'Saint Laurent', 'Chanel', 'Valentino', "Church's", 'Jimmy Choo', 'Common Projects'],
  Accessoires: ['Hermès', 'Gucci', 'Louis Vuitton', 'Dior', 'Fendi', 'Burberry', 'Saint Laurent', 'Prada'],
  Bijoux: ['Cartier', 'Van Cleef & Arpels', 'Tiffany & Co.', 'Bulgari', 'Chanel', 'Dior', 'Messika'],
  Montres: ['Rolex', 'Cartier', 'Omega', 'Patek Philippe', 'TAG Heuer', 'Breitling', 'IWC', 'Longines'],
  'Montres connectées': ['Apple', 'TAG Heuer Connected', 'Samsung', 'Garmin', 'Fossil'],
  Beauté: ['Chanel', 'Dior', 'Guerlain', 'YSL Beauté', 'La Mer', 'Tom Ford', 'Byredo'],
};

const PRICE_RANGES: Record<string, [number, number]> = {
  Sacs: [400, 4500],
  Vêtements: [90, 1400],
  Chaussures: [180, 1300],
  Accessoires: [70, 900],
  Bijoux: [150, 3500],
  Montres: [900, 18000],
  'Montres connectées': [200, 900],
  Beauté: [25, 160],
};

const DESCRIPTORS: Record<string, string[]> = {
  Sacs: ['en cuir grainé', 'en toile monogram', 'matelassé', 'en cuir verni', 'édition limitée'],
  Vêtements: ['en soie', 'en laine mérinos', 'en cachemire', 'coupe oversize', 'édition défilé'],
  Chaussures: ['en cuir verni', 'à talon aiguille', 'semelle iconique', 'en daim'],
  Accessoires: ['en cuir tressé', 'à motif monogram', 'édition limitée'],
  Bijoux: ['en or 18 carats', 'serti de diamants', 'en argent massif'],
  Montres: ['automatique', 'chronographe', 'édition limitée', 'cadran nacre'],
  'Montres connectées': ['GPS intégré', 'écran AMOLED', 'étanche', 'autonomie longue durée'],
  Beauté: ['édition limitée', 'coffret'],
};

const CONDITIONS = ['Neuf', 'Très bon état', 'Très bon état', 'Bon état', 'Bon état', 'Satisfaisant'];
const LOCATIONS = ['Paris', 'Lyon', 'Marseille', 'Bordeaux', 'Lille', 'Nice', 'Nantes', 'Strasbourg', 'Toulouse', 'Cannes'];
const CLOTHING_SIZES = ['XS', 'S', 'M', 'L', 'XL'];
const SHOE_SIZES = ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45'];
const BEAUTY_SIZES = ['30 ml', '50 ml', '75 ml', '100 ml'];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomPrice([min, max]: [number, number]): number {
  return Math.round((min + Math.random() * (max - min)) * 100) / 100;
}

function sizeFor(poolKey: string): string {
  if (poolKey === 'Vêtements') return pick(CLOTHING_SIZES);
  if (poolKey === 'Chaussures') return pick(SHOE_SIZES);
  if (poolKey === 'Beauté') return pick(BEAUTY_SIZES);
  return 'Unique';
}

async function run() {
  await AppDataSource.initialize();
  const categoryRepo = AppDataSource.getRepository(Category);
  const productRepo = AppDataSource.getRepository(Product);
  const userRepo = AppDataSource.getRepository(User);

  const allCategories = await categoryRepo.find({ relations: ['parent'] });
  const parentIds = new Set(allCategories.map((c) => c.parent?.id).filter(Boolean));
  const leaves = allCategories.filter((c) => !parentIds.has(c.id));

  const approvedSellers = await userRepo.find({ where: { sellerStatus: 'approved' } });

  console.log(`Catégories feuilles trouvées : ${leaves.length}`);
  console.log(`Vendeurs approuvés trouvés : ${approvedSellers.length}`);

  const deleted = await productRepo.createQueryBuilder().delete().execute();
  console.log(`Produits supprimés : ${deleted.affected ?? 0}`);

  let counter = 0;
  const toInsert: Partial<Product>[] = [];

  for (const leaf of leaves) {
    const poolKey = BRAND_POOLS[leaf.name] ? leaf.name : BRAND_POOLS[leaf.parent?.name ?? ''] ? leaf.parent!.name : 'Accessoires';
    const brands = BRAND_POOLS[poolKey];
    const priceRange = PRICE_RANGES[poolKey];
    const descriptors = DESCRIPTORS[poolKey];

    for (let i = 0; i < PRODUCTS_PER_LEAF; i++) {
      counter++;
      const brand = pick(brands);
      const condition = pick(CONDITIONS);
      const location = pick(LOCATIONS);
      const withDescriptor = Math.random() < 0.35;
      const name = withDescriptor ? `${leaf.name} ${brand} ${pick(descriptors)}` : `${leaf.name} ${brand}`;
      const seller = approvedSellers.length > 0 && Math.random() < 0.65 ? pick(approvedSellers) : null;

      toInsert.push({
        name,
        brand,
        description: `${brand} authentique, ${leaf.name.toLowerCase()} en ${condition.toLowerCase()}. Vérifié par nos experts avant mise en vente. Provenance : ${location}.`,
        price: randomPrice(priceRange),
        categoryId: leaf.id,
        sellerId: seller?.id ?? null,
        listingStatus: 'active',
        images: [1, 2, 3].map((n) => `https://picsum.photos/seed/aquilas-${counter}-${n}/800/800`),
        stock: 1 + Math.floor(Math.random() * 6),
        condition,
        size: sizeFor(poolKey),
        location,
        active: Math.random() < 0.9,
        weLove: Math.random() < 0.08,
      });
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await productRepo.insert(toInsert as any);
  console.log(`Produits créés : ${toInsert.length}`);

  await AppDataSource.destroy();
}

run()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
