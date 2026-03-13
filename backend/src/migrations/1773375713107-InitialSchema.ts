import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1773375713107 implements MigrationInterface {
    name = 'InitialSchema1773375713107'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "plans" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "price_monthly" numeric(10,2) NOT NULL, "price_yearly" numeric(10,2) NOT NULL, "submission_limit" integer NOT NULL DEFAULT '3', "user_limit" integer NOT NULL DEFAULT '1', "workflow_enabled" boolean NOT NULL DEFAULT false, "geo_enabled" boolean NOT NULL DEFAULT false, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_3720521a81c7c24fe9b7202ba61" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."subscriptions_status_enum" AS ENUM('trial', 'active', 'past_due', 'canceled', 'expired')`);
        await queryRunner.query(`CREATE TABLE "subscriptions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "tenant_id" character varying NOT NULL, "paystack_customer_code" character varying, "paystack_subscription_code" character varying, "plan_id" uuid NOT NULL, "status" "public"."subscriptions_status_enum" NOT NULL DEFAULT 'trial', "current_period_start" TIMESTAMP, "current_period_end" TIMESTAMP, "next_billing_date" TIMESTAMP, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_f6ac03431c311ccb8bbd7d3af18" UNIQUE ("tenant_id"), CONSTRAINT "PK_a87248d73155605cf782be9ee5e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "tenants" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "slug" character varying NOT NULL, "sector" character varying, "is_active" boolean NOT NULL DEFAULT true, "billing_email" character varying, "billing_name" character varying, "billing_address" text, "billing_city" character varying, "billing_state" character varying, "billing_zip" character varying, "tax_id" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_32731f181236a46182a38c992a8" UNIQUE ("name"), CONSTRAINT "UQ_2310ecc5cb8be427097154b18fc" UNIQUE ("slug"), CONSTRAINT "PK_53be67a04681c66b87ee27c9321" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_2310ecc5cb8be427097154b18f" ON "tenants" ("slug") `);
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('admin', 'member', 'field_operative')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "first_name" character varying NOT NULL, "last_name" character varying NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "role" "public"."users_role_enum" NOT NULL DEFAULT 'member', "tenant_id" uuid NOT NULL, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_109638590074998bb72a2f2cf0" ON "users" ("tenant_id") `);
        await queryRunner.query(`CREATE TABLE "forms" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" character varying, "category" character varying, "schema" jsonb NOT NULL, "status" character varying NOT NULL DEFAULT 'draft', "version" integer NOT NULL DEFAULT '1', "is_active" boolean NOT NULL DEFAULT true, "tenant_id" uuid NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_ba062fd30b06814a60756f233da" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_0cbe96e86f2e7892582e65a0a5" ON "forms" ("tenant_id") `);
        await queryRunner.query(`CREATE TABLE "submissions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "form_id" uuid NOT NULL, "data" jsonb NOT NULL, "location" jsonb, "tenant_id" uuid NOT NULL, "captured_by_user_id" character varying, "submitted_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_10b3be95b8b2fb1e482e07d706b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_e25e75ed85ca1ba8b32fde8d17" ON "submissions" ("submitted_at") `);
        await queryRunner.query(`CREATE TYPE "public"."dispatches_status_enum" AS ENUM('pending', 'assigned', 'started', 'completed', 'cancelled')`);
        await queryRunner.query(`CREATE TABLE "dispatches" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "form_id" uuid NOT NULL, "assigned_to_id" uuid NOT NULL, "status" "public"."dispatches_status_enum" NOT NULL DEFAULT 'pending', "scheduled_at" TIMESTAMP, "location_name" character varying, "pre_filled_data" jsonb, "notes" character varying, "tenant_id" uuid NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_e4f5defc12b20b66acf58f5c8b9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_e783506b495f0bdbdce34f4843" ON "dispatches" ("form_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_457274da75e19fb039d327882f" ON "dispatches" ("assigned_to_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_d5060c5bc7820f8ae4d219bcdc" ON "dispatches" ("tenant_id") `);
        await queryRunner.query(`CREATE TABLE "billing_events" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "tenant_id" character varying NOT NULL, "event_type" character varying NOT NULL, "raw_payload" jsonb NOT NULL, "processed_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_9a4a4a1b1f55bbc868f6a76a597" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "subscriptions" ADD CONSTRAINT "FK_e45fca5d912c3a2fab512ac25dc" FOREIGN KEY ("plan_id") REFERENCES "plans"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_109638590074998bb72a2f2cf08" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "forms" ADD CONSTRAINT "FK_0cbe96e86f2e7892582e65a0a56" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "submissions" ADD CONSTRAINT "FK_82318f9579f8f3df8480d46990f" FOREIGN KEY ("form_id") REFERENCES "forms"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "submissions" ADD CONSTRAINT "FK_d3d5aa4f93a2332f31978185598" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "dispatches" ADD CONSTRAINT "FK_e783506b495f0bdbdce34f48439" FOREIGN KEY ("form_id") REFERENCES "forms"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "dispatches" ADD CONSTRAINT "FK_457274da75e19fb039d327882f2" FOREIGN KEY ("assigned_to_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "dispatches" ADD CONSTRAINT "FK_d5060c5bc7820f8ae4d219bcdca" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "dispatches" DROP CONSTRAINT "FK_d5060c5bc7820f8ae4d219bcdca"`);
        await queryRunner.query(`ALTER TABLE "dispatches" DROP CONSTRAINT "FK_457274da75e19fb039d327882f2"`);
        await queryRunner.query(`ALTER TABLE "dispatches" DROP CONSTRAINT "FK_e783506b495f0bdbdce34f48439"`);
        await queryRunner.query(`ALTER TABLE "submissions" DROP CONSTRAINT "FK_d3d5aa4f93a2332f31978185598"`);
        await queryRunner.query(`ALTER TABLE "submissions" DROP CONSTRAINT "FK_82318f9579f8f3df8480d46990f"`);
        await queryRunner.query(`ALTER TABLE "forms" DROP CONSTRAINT "FK_0cbe96e86f2e7892582e65a0a56"`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_109638590074998bb72a2f2cf08"`);
        await queryRunner.query(`ALTER TABLE "subscriptions" DROP CONSTRAINT "FK_e45fca5d912c3a2fab512ac25dc"`);
        await queryRunner.query(`DROP TABLE "billing_events"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_d5060c5bc7820f8ae4d219bcdc"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_457274da75e19fb039d327882f"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e783506b495f0bdbdce34f4843"`);
        await queryRunner.query(`DROP TABLE "dispatches"`);
        await queryRunner.query(`DROP TYPE "public"."dispatches_status_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e25e75ed85ca1ba8b32fde8d17"`);
        await queryRunner.query(`DROP TABLE "submissions"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_0cbe96e86f2e7892582e65a0a5"`);
        await queryRunner.query(`DROP TABLE "forms"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_109638590074998bb72a2f2cf0"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_2310ecc5cb8be427097154b18f"`);
        await queryRunner.query(`DROP TABLE "tenants"`);
        await queryRunner.query(`DROP TABLE "subscriptions"`);
        await queryRunner.query(`DROP TYPE "public"."subscriptions_status_enum"`);
        await queryRunner.query(`DROP TABLE "plans"`);
    }

}
