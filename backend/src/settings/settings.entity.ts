import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity()
export class Setting {
  @PrimaryColumn()
  key: string;

  @Column('text')
  value: string;
}
