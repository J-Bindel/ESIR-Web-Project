import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class User {
        @PrimaryGeneratedColumn()
        public id : number;
        @Column()
        public firstname : string;
        @Column()
        public lastname : string;
        @Column()
        public age : number;  
        @Column()
        public email: string;
        @Column()
        public password : string;  
} 