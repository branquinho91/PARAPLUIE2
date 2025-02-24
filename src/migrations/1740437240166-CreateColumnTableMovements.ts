import { MigrationInterface, QueryRunner, TableForeignKey, TableColumn } from "typeorm";

export class CreateColumnTableMovements1740437240166 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      "movements",
      new TableColumn({
        name: "driver_id",
        type: "int",
        isNullable: true,
      }),
    );

    await queryRunner.createForeignKey(
      "movements",
      new TableForeignKey({
        columnNames: ["driver_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "drivers",
        onDelete: "CASCADE",
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey("movements", "driver_id");
    await queryRunner.dropColumn("movements", "driver_id");
  }
}
