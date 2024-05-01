import { Injectable } from '@nestjs/common';
import { User } from './user.entity';
import { Equal, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    
    constructor(
        @InjectRepository(User)
        private repository: Repository<User>
    ) { }

    public getAllUsers(): Promise <User[]> {
        return this.repository.find();
    }

    public async getUserById(id: number): Promise <User> {
         return await this.repository.findOne({where: {id: Equal(id)}});
    }

    public async getUserByEmail(email: string): Promise <User> {
        return await this.repository.findOne({where: {email: Equal(email)}});
    }
     
    public async create(firstname: string, lastname: string, age: number, email: string, password: string): Promise <User> {
        const saltOrRounds = 10;
        const hash = await bcrypt.hash(password, saltOrRounds);
         const newUser: User = await this.repository.create ({
            firstname: firstname,
            lastname: lastname,
            age: age,
            email: email,
            password: hash
         })
         await this.repository.save(newUser);
         return newUser;
     }
     
    public async setUser(id: number, firstname: string, lastname: string, age: number, email: string, password: string): Promise <User>{
         if (firstname !== undefined && lastname !== undefined && age !== undefined && email !== undefined && password !== undefined) {
            const saltOrRounds = 10;
            const hash = await bcrypt.hash(password, saltOrRounds);
            const user: User = await this.repository.findOne({where: {id: Equal(id)}});
            user.firstname = firstname;
            user.lastname = lastname;
            user.age = age;
            user.email = email;
            user.password = hash;
            await this.repository.save(user);
            return user;
         }
         return undefined;
     }
      
    public async deleteUser(id: number) : Promise <boolean>{
        const user: User = await this.getUserById(id);
        await this.repository.delete(user);
        return true;
     }
}
