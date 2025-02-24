import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from "typeorm";
import { Branch } from "./Branch";
import { Product } from "./Product";
import { MovementStatus } from "../utils/movementStatusEnum";
import { Driver } from "./Driver";

@Entity("movements")
export class Movement {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Branch, { onDelete: "CASCADE" })
  @JoinColumn({ name: "destination_branch_id" })
  destinationBranch: Branch;

  @ManyToOne(() => Product, { onDelete: "CASCADE" })
  @JoinColumn({ name: "product_id" })
  product: Product;

  @ManyToOne(() => Driver, { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "driver_id" })
  driver: Driver;

  @Column({ type: "int" })
  quantity: number;

  @Column({
    type: "enum",
    enum: MovementStatus,
    enumName: "movement_status_enum",
    default: MovementStatus.PENDING,
  })
  status: MovementStatus;

  @CreateDateColumn({ name: "created_at", type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  @UpdateDateColumn({
    name: "updated_at",
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
    onUpdate: "CURRENT_TIMESTAMP",
  })
  updatedAt: Date;
}
