import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  OneToOne,
  JoinColumn,
} from "typeorm";
import { User } from "./User";
import { Product } from "./Product";

@Entity("branches")
export class Branch {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: "full_address", type: "varchar", length: 255, nullable: true })
  fullAddress: string;

  @Column({ type: "varchar", length: 30, unique: true })
  document: string;

  @OneToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user: User;

  @OneToMany(() => Product, (product) => product.branch)
  products: Product[];

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
