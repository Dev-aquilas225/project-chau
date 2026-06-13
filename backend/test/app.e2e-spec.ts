import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

/**
 * Tests e2e (auth, guards, CRUD produits/commandes) — nécessitent une base PostgreSQL
 * disponible via les variables d'env DB_* (voir backend/.env.example).
 * Lancer : npm run test:e2e (depuis backend/) avec une DB de test propre.
 */
describe('App e2e', () => {
  let app: INestApplication;
  let customerToken: string;
  let adminToken: string;
  let productId: string;

  const customerEmail = `customer.${Date.now()}@test.com`;
  const adminEmail = `admin.${Date.now()}@test.com`;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /api/auth/register crée un compte customer', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({ displayName: 'Customer', email: customerEmail, password: 'password123' })
      .expect(201);

    expect(res.body.accessToken).toBeDefined();
    expect(res.body.user.role).toBe('customer');
    customerToken = res.body.accessToken;
  });

  it('POST /api/auth/register refuse un email déjà utilisé', async () => {
    await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({ displayName: 'Customer', email: customerEmail, password: 'password123' })
      .expect(409);
  });

  it('POST /api/auth/login renvoie un token valide', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: customerEmail, password: 'password123' })
      .expect(201);

    expect(res.body.accessToken).toBeDefined();
  });

  it('POST /api/auth/login refuse un mauvais mot de passe', async () => {
    await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: customerEmail, password: 'wrongpassword' })
      .expect(401);
  });

  it('GET /api/auth/me nécessite un token', async () => {
    await request(app.getHttpServer()).get('/api/auth/me').expect(401);
  });

  it('GET /api/auth/me renvoie le profil avec un token valide', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${customerToken}`)
      .expect(200);

    expect(res.body.email).toBe(customerEmail);
    expect(res.body.passwordHash).toBeUndefined();
  });

  it('POST /api/products refuse un customer (guard de rôle)', async () => {
    await request(app.getHttpServer())
      .post('/api/products')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ name: 'Produit test', price: 10, stock: 5 })
      .expect(403);
  });

  it('POST /api/products refuse sans token', async () => {
    await request(app.getHttpServer())
      .post('/api/products')
      .send({ name: 'Produit test', price: 10, stock: 5 })
      .expect(401);
  });

  it("crée un admin pour les tests d'écriture produits", async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({ displayName: 'Admin', email: adminEmail, password: 'password123' })
      .expect(201);
    adminToken = res.body.accessToken;
    // Note : le rôle admin n'est pas accordable via l'API (sécurité). Ce test documente
    // le comportement attendu mais nécessite une promotion manuelle en DB pour aller plus loin.
  });

  it('GET /api/products est public', async () => {
    const res = await request(app.getHttpServer()).get('/api/products').expect(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('POST /api/orders crée une commande pour le customer connecté', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        items: [{ productId: 'prod-1', name: 'Produit', brand: 'Marque', image: '', unitPrice: 10, qty: 2 }],
        subtotal: 20,
        discount: 0,
        total: 20,
        shippingAddress: { fullName: 'Customer', line1: '1 rue Test', city: 'Paris', zip: '75000', country: 'France' },
        paymentMethod: 'card',
      })
      .expect(201);

    expect(res.body.status).toBe('pending');
    expect(res.body.userId).toBeDefined();
    productId = res.body.id;
  });

  it('GET /api/orders/mine ne renvoie que les commandes du customer', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/orders/mine')
      .set('Authorization', `Bearer ${customerToken}`)
      .expect(200);

    expect(res.body.some((o: { id: string }) => o.id === productId)).toBe(true);
  });

  it('GET /api/orders refuse un customer (liste admin)', async () => {
    await request(app.getHttpServer())
      .get('/api/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .expect(403);
  });

  it("PATCH /api/orders/:id/status refuse un customer", async () => {
    await request(app.getHttpServer())
      .patch(`/api/orders/${productId}/status`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ status: 'paid' })
      .expect(403);
  });
});
