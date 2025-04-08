import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1744127091369 implements MigrationInterface {
    name = 'InitialMigration1744127091369'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."transaction_type_enum" AS ENUM('deposit', 'withdrawal', 'exchange', 'transfer')`);
        await queryRunner.query(`CREATE TYPE "public"."transaction_status_enum" AS ENUM('pending', 'completed', 'failed', 'reversed')`);
        await queryRunner.query(`CREATE TABLE "transaction" ("id" SERIAL NOT NULL, "type" "public"."transaction_type_enum" NOT NULL, "amount" numeric(19,4) NOT NULL, "currency" character varying(3) NOT NULL, "convertedAmount" numeric(19,4), "convertedCurrency" character varying(3), "exchangeRate" numeric(19,6), "status" "public"."transaction_status_enum" NOT NULL DEFAULT 'pending', "description" character varying, "reference" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" integer NOT NULL, "walletId" integer, CONSTRAINT "UQ_0b12a144bdc7678b6ddb0b913fc" UNIQUE ("reference"), CONSTRAINT "PK_89eadb93a89810556e1cbcd6ab9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_93eec1dc9929b693290355d404" ON "transaction" ("reference", "status") `);
        await queryRunner.query(`CREATE INDEX "IDX_a075f18d62af01bcd777b8cb68" ON "transaction" ("userId", "createdAt") `);
        await queryRunner.query(`CREATE TABLE "wallet" ("id" SERIAL NOT NULL, "currency" character varying(3) NOT NULL, "balance" numeric(19,4) NOT NULL DEFAULT '0', "userId" integer NOT NULL, "isLocked" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_bec464dd8d54c39c54fd32e2334" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_c8d0130b44210fe9bb058e30c4" ON "wallet" ("userId", "currency") `);
        await queryRunner.query(`CREATE TABLE "users" ("id" SERIAL NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "isVerified" boolean NOT NULL DEFAULT false, "verification_token_hash" character varying(255), "verification_token_expires" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "fx_rate" ("id" SERIAL NOT NULL, "fromCurrency" character varying(3) NOT NULL, "toCurrency" character varying(3) NOT NULL, "rate" numeric(19,6) NOT NULL, "bidPrice" numeric(19,6), "askPrice" numeric(19,6), "expiresAt" TIMESTAMP NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "source" character varying, CONSTRAINT "PK_172deb302807396e0da8f0aafe0" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_d6a7a3554d3ceb6c80d899de24" ON "fx_rate" ("fromCurrency", "toCurrency", "expiresAt") `);
        await queryRunner.query(`ALTER TABLE "transaction" ADD CONSTRAINT "FK_605baeb040ff0fae995404cea37" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "transaction" ADD CONSTRAINT "FK_900eb6b5efaecf57343e4c0e79d" FOREIGN KEY ("walletId") REFERENCES "wallet"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "wallet" ADD CONSTRAINT "FK_35472b1fe48b6330cd349709564" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "wallet" DROP CONSTRAINT "FK_35472b1fe48b6330cd349709564"`);
        await queryRunner.query(`ALTER TABLE "transaction" DROP CONSTRAINT "FK_900eb6b5efaecf57343e4c0e79d"`);
        await queryRunner.query(`ALTER TABLE "transaction" DROP CONSTRAINT "FK_605baeb040ff0fae995404cea37"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_d6a7a3554d3ceb6c80d899de24"`);
        await queryRunner.query(`DROP TABLE "fx_rate"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c8d0130b44210fe9bb058e30c4"`);
        await queryRunner.query(`DROP TABLE "wallet"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_a075f18d62af01bcd777b8cb68"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_93eec1dc9929b693290355d404"`);
        await queryRunner.query(`DROP TABLE "transaction"`);
        await queryRunner.query(`DROP TYPE "public"."transaction_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."transaction_type_enum"`);
    }

}
