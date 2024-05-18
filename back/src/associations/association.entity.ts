import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Association {
    @PrimaryGeneratedColumn()
    public id : number;
    @Column()
    public userIds : string;
    @Column()
    public name : string;
    @Column()
    public password: string;
}

