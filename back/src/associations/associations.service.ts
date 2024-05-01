import { Injectable } from '@nestjs/common';
import { User } from 'src/users/user.entity';
import { UsersService } from 'src/users/users.service';
import { Association } from './association.entity';
import { Equal, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

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
     
    public async create(idUsers: number[], name: string): Promise <Association> {
        const users: User[] = [];
        idUsers.forEach(async id => {users.push(await this.service.getUserById(id))});
        const newAsso: Association = this.repository.create({
            users: users, 
            name: name
        });
        await this.repository.save(newAsso);
        return newAsso;
     }
     
    public async setAsso(id: number, idUsers: number [], name: string): Promise <Association> {
        if (idUsers !== undefined && name !== undefined) {
            const users: User [] = [];
            idUsers.forEach(async id => {users.push(await this.service.getUserById(id))});
            const asso: Association = await this.repository.findOne({where: {id: Equal(id)}});
            asso.users = users;
            asso.name = name;
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
