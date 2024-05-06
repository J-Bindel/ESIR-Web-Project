import { Injectable } from '@nestjs/common';
import { User } from 'src/users/user.entity';
import { UsersService } from 'src/users/users.service';
import { Association } from './association.entity';
import { Equal, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AssociationsService {
    
    constructor(
        @InjectRepository(Association)
        private repository: Repository <Association>,
        private service: UsersService
    ) {}
    
    public async getAllAssos(): Promise <Association[]> {
        return this.repository.find();
    }

    public async getAssoById(id : number): Promise <Association> {
        return await this.repository.findOne({where: {id: Equal(id)}});
     }
     
    public async create(idUsers: number[], name: string, password: string): Promise <Association> {
        const saltOrRounds = 10;
        const hash = await bcrypt.hash(password, saltOrRounds);
        const users: User[] = [];
        idUsers.forEach(async id => {users.push(await this.service.getUserById(id))});
        const newAssociation: Association = await this.repository.create({
            users: users, 
            name: name,
            password: hash
        });
        await this.repository.save(newAssociation);
        return newAssociation;
     }
     
    public async setAsso(id: number, idUsers: number [], name: string, password: string): Promise <Association> {
        const saltOrRounds = 10;
        const hash = await bcrypt.hash(password, saltOrRounds);
        if (idUsers !== undefined && name !== undefined) {
            const users: User [] = [];
            idUsers.forEach(async id => {users.push(await this.service.getUserById(id))});
            const asso: Association = await this.repository.findOne({where: {id: Equal(id)}});
            asso.users = users;
            asso.name = name;
            asso.password = hash;
            await this.repository.save(asso);
            return asso;
        }
        return undefined;
     }
      
    public async deleteAsso(id : number) : Promise <boolean> {
        const asso: Association = await this.repository.findOne({where: {id: Equal(id)}});
        await this.repository.delete(asso);
        return true;
     }

     public async getMembers(id: number): Promise <User[]> {
        const asso: Association = await this.repository.findOne({where: {id: Equal(id)}});
        return asso.users;
     }

}
