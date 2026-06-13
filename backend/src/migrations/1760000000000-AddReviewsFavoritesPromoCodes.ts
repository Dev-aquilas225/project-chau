import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddReviewsFavoritesPromoCodes1760000000000 implements MigrationInterface {
  name = 'AddReviewsFavoritesPromoCodes1760000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "reviews" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "userId" uuid NOT NULL,
        "productId" uuid NOT NULL,
        "rating" integer NOT NULL,
        "comment" text NOT NULL DEFAULT '',
        "createdAt" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "PK_reviews_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_reviews_user" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_reviews_product" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_reviews_productId" ON "reviews" ("productId")`);
    await queryRunner.query(`CREATE INDEX "IDX_reviews_userId" ON "reviews" ("userId")`);

    await queryRunner.query(`
      CREATE TABLE "favorites" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "userId" uuid NOT NULL,
        "productId" uuid NOT NULL,
        "createdAt" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "PK_favorites_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_favorites_user_product" UNIQUE ("userId", "productId"),
        CONSTRAINT "FK_favorites_user" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_favorites_product" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_favorites_userId" ON "favorites" ("userId")`);

    await queryRunner.query(`
      CREATE TABLE "promo_codes" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "code" varchar NOT NULL,
        "discountType" varchar NOT NULL,
        "discountValue" numeric(10,2) NOT NULL,
        "minAmount" numeric(10,2) NOT NULL DEFAULT 0,
        "expiresAt" timestamp,
        "active" boolean NOT NULL DEFAULT true,
        "createdAt" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "PK_promo_codes_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_promo_codes_code" UNIQUE ("code")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "promo_codes"`);
    await queryRunner.query(`DROP TABLE "favorites"`);
    await queryRunner.query(`DROP TABLE "reviews"`);
  }
}
