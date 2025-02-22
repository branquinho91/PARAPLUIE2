import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";
import { MovementStatus } from "../utils/movementStatusEnum";

export class CreateTableMovements1740240041853 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "movements",
        columns: [
          {
            name: "id",
            type: "int",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "increment",
          },
          {
            name: "destination_branch_id",
            type: "int",
            isNullable: false,
          },
          {
            name: "product_id",
            type: "int",
            isNullable: false,
          },
          {
            name: "quantity",
            type: "int",
            isNullable: false,
          },
          {
            name: "status",
            type: "enum",
            enum: Object.values(MovementStatus),
            enumName: "movement_status_enum",
            isNullable: false,
            default: `'${MovementStatus.PENDING}'`,
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
      "movements",
      new TableForeignKey({
        columnNames: ["destination_branch_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "branches",
        onDelete: "CASCADE",
      }),
    );

    await queryRunner.createForeignKey(
      "movements",
      new TableForeignKey({
        columnNames: ["product_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "products",
        onDelete: "CASCADE",
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable("movements");
    if (table) {
      const foreignKey1 = table.foreignKeys.find((fk) =>
        fk.columnNames.includes("destination_branch_id"),
      );
      if (foreignKey1) {
        await queryRunner.dropForeignKey("movements", foreignKey1);
      }

      const foreignKey2 = table.foreignKeys.find((fk) => fk.columnNames.includes("product_id"));
      if (foreignKey2) {
        await queryRunner.dropForeignKey("movements", foreignKey2);
      }
    }

    await queryRunner.dropTable("movements");
  }
}
