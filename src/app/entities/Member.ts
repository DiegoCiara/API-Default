import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, BaseEntity, DeleteDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import Product from './Product';

@Entity()
class Members extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column({ type: 'enum', enum: ['DARK', 'LIGHT'], default: 'DARK' })
	theme: string 

  @ManyToOne((type) => Product)
  @JoinColumn()
  product: Product;

  @Column({ type: 'enum', enum: ['Em andamento', 'Ativo', 'Cancelado', 'Pendente'], default: 'Em andamento' })
  status: string;

  @Column()
  passwordHash: string;

  @Column({ nullable: true })
  picture: string;

  @Column({ nullable: true })
  passwordResetToken: string;

  @Column({ nullable: true, type: 'timestamp' })
  passwordResetExpires: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}

export default Members;
