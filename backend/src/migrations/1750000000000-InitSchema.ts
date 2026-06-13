import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitSchema1750000000000 implements MigrationInterface {
  name = 'InitSchema1750000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);

    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "email" varchar NOT NULL,
        "displayName" varchar NOT NULL,
        "passwordHash" varchar NOT NULL,
        "role" varchar NOT NULL DEFAULT 'customer',
        "addresses" jsonb NOT NULL DEFAULT '[]',
        "createdAt" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_users_email" UNIQUE ("email"),
        CONSTRAINT "PK_users_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "categories" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "name" varchar NOT NULL,
        "slug" varchar NOT NULL,
        "parentId" uuid,
        CONSTRAINT "UQ_categories_slug" UNIQUE ("slug"),
        CONSTRAINT "PK_categories_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_categories_parent" FOREIGN KEY ("parentId") REFERENCES "categories"("id") ON DELETE SET NULL
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "products" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "name" varchar NOT NULL,
        "brand" varchar NOT NULL DEFAULT '',
        "description" text NOT NULL DEFAULT '',
        "price" numeric(10,2) NOT NULL,
        "categoryId" uuid,
        "images" jsonb NOT NULL DEFAULT '[]',
        "stock" integer NOT NULL DEFAULT 0,
        "condition" varchar,
        "size" varchar,
        "location" varchar,
        "active" boolean NOT NULL DEFAULT true,
        "weLove" boolean NOT NULL DEFAULT false,
        "createdAt" timestamp NOT NULL DEFAULT now(),
        "updatedAt" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "PK_products_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_products_category" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE SET NULL
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "orders" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "userId" uuid NOT NULL,
        "items" jsonb NOT NULL,
        "subtotal" numeric(10,2) NOT NULL,
        "discount" numeric(10,2) NOT NULL DEFAULT 0,
        "total" numeric(10,2) NOT NULL,
        "promoCode" varchar,
        "status" varchar NOT NULL DEFAULT 'pending',
        "shippingAddress" jsonb NOT NULL,
        "paymentMethod" varchar NOT NULL DEFAULT '',
        "createdAt" timestamp NOT NULL DEFAULT now(),
        "updatedAt" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "PK_orders_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_orders_user" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`CREATE INDEX "IDX_products_active_createdAt" ON "products" ("active", "createdAt")`);
    await queryRunner.query(`CREATE INDEX "IDX_products_categoryId" ON "products" ("categoryId")`);
    await queryRunner.query(`CREATE INDEX "IDX_orders_userId" ON "orders" ("userId")`);
    await queryRunner.query(`CREATE INDEX "IDX_orders_status" ON "orders" ("status")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "orders"`);
    await queryRunner.query(`DROP TABLE "products"`);
    await queryRunner.query(`DROP TABLE "categories"`);
    await queryRunner.query(`DROP TABLE "users"`);
  }
}
