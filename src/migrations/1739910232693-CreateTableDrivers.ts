import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateTableDrivers1739910232693 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "drivers",
        columns: [
          {
            name: "id",
            type: "int",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "increment",
          },
          {
            name: "full_address",
            type: "varchar",
            length: "255",
            isNullable: true,
          },
          {
            name: "document",
            type: "varchar",
            length: "30",
            isNullable: false,
            isUnique: true,
          },
          {
            name: "user_id",
            type: "int",
            isNullable: false,
          },
          {
            name: "created_at",
            type: "timestamp",
            default: "now()",
            isNullable: false,
          },
          {
            name: "updated_at",
            type: "timestamp",
            default: "now()",
            isNullable: false,
            onUpdate: "CURRENT_TIMESTAMP",
          },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      "drivers",
      new TableForeignKey({
        columnNames: ["user_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "users",
        onDelete: "CASCADE",
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable("drivers");
    if (table) {
      const foreignKey = table.foreignKeys.find((fk) => fk.columnNames.includes("user_id"));
      if (foreignKey) {
        await queryRunner.dropForeignKey("drivers", foreignKey);
      }
    }

    await queryRunner.dropTable("drivers");
  }
}
