import { Injectable } from '@nestjs/common';
import { User } from './user.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UserDeletedEvent } from './user.events';
import { Equal, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { ProducerService } from '../queue/producer.service';

@Injectable()
export class UsersService {
    
    constructor(
        @InjectRepository(User)
        private repository: Repository<User>,
        private producerService: ProducerService,
        private readonly eventEmitter: EventEmitter2,
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
         await this.notifyComponents(newUser, {}, 'user create');
         return newUser;
     }
     
    public async setUser(id: number, firstname: string, lastname: string, age: number, email: string, password: string): Promise <User>{
        if (
            firstname !== undefined &&
            lastname !== undefined &&
            age !== undefined &&
            email !== undefined &&
            password !== undefined
          ) {

            const user: User = await this.repository.findOne({ where: { id: Equal(id) } });

            if (!user) {
                throw new Error('User not found');
            }
            
            const modifiedFields: { [key: string]: any } = {};

            if (user.firstname !== firstname) {
                modifiedFields.firstname = firstname;
                user.firstname = firstname;
            }
            if (user.lastname !== lastname) {
                modifiedFields.lastname = lastname;
                user.lastname = lastname;
            }
            if (user.age !== age) {
                modifiedFields.age = age;
                user.age = age;
            }
            if (user.email !== email) {
                modifiedFields.email = email;
                user.email = email;
            }
            
            
            const isPasswordModified = await bcrypt.compare(password, user.password);
            if (!isPasswordModified) {
                const saltOrRounds = 10;
                const hash = await bcrypt.hash(password, saltOrRounds);
                modifiedFields.password = '******';
                user.password = hash;
            }

            if (Object.keys(modifiedFields).length > 0) {
                await this.notifyComponents(user, modifiedFields, 'user update');
            }

            return user;
        }

        return undefined;
    }
      
    public async deleteUser(id: number) : Promise <boolean>{
        const user: User = await this.getUserById(id);
        await this.notifyComponents(user, {},'user delete');
        return true;
     }

    private async notifyComponents(user: User, modifiedFields: { [key: string]: any }, notificationType: string): Promise<void> {
        // Create user, modified fields and notification type
        const notification = {
            email: user.email,
            user,
            modifiedFields,
            notificationType,
        };
        await this.producerService.addToNotificationQueue(notification);
        if (notificationType !== 'user delete') {
            await this.repository.save(user);
        } else {
            await this.repository.delete(user);
            this.eventEmitter.emit('user.deleted', new UserDeletedEvent(user.id));
        }
    }
}
