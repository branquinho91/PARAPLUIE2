import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateTableProducts1740239987582 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "products",
        columns: [
          {
            name: "id",
            type: "int",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "increment",
          },
          {
            name: "name",
            type: "varchar",
            length: "200",
            isNullable: false,
          },
          {
            name: "amount",
            type: "int",
            isNullable: false,
          },
          {
            name: "description",
            type: "varchar",
            length: "200",
            isNullable: false,
          },
          {
            name: "url_cover",
            type: "varchar",
            length: "200",
            isNullable: true,
          },
          {
            name: "branch_id",
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
      "products",
      new TableForeignKey({
        columnNames: ["branch_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "branches",
        onDelete: "CASCADE",
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable("products");
    if (table) {
      const foreignKey = table.foreignKeys.find((fk) => fk.columnNames.includes("branch_id"));
      if (foreignKey) {
        await queryRunner.dropForeignKey("products", foreignKey);
      }
    }

    await queryRunner.dropTable("products");
  }
}
