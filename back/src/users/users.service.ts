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
         await this.notifyComponent(newUser, 'create');
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
            await this.notifyComponent(user, 'update');
            return user;
         }
         return undefined;
     }
      
    public async deleteUser(id: number) : Promise <boolean>{
        const user: User = await this.getUserById(id);
        await this.notifyComponent(user, 'delete');
        return true;
     }

    private async sendEmail(user: User, emailType: string): Promise<void> {
        let subject: string;
        let html: string;

        if (emailType === 'create') {
            subject = 'Welcome to French association administration service!';
            html = `<h1>Welcome ${user.firstname} ${user.lastname}!</h1>
            <p>You have successfully created an account on our service.</p>
            <p>We wish you a nice experience with our service.</p>`;
        } else if (emailType === 'update') {
            subject = '[French association administration service] Your account has been updated';
            html = `<h1>Hello ${user.firstname} ${user.lastname}!</h1>
            <p>Your account has been updated.</p>
            <p>If you did not perform this operation, please contact us.</p>`;
        } else if (emailType === 'delete') {
            subject = '[French association administration service] Your account has been deleted';
            html = `<h1>Goodbye ${user.firstname} ${user.lastname}!</h1>
            <p>Your account has been deleted.</p>
            <p>If you did not perform this operation, please contact us.</p>`;
        }

        const message = {
            email: user.email,
            subject: subject,
            html: html
        }
        
        await this.producerService.addToEmailQueue(message);
    }

    private async notifyComponent(user: User, notificationType: string): Promise<void> {
        if (notificationType !== 'delete') {
            await this.repository.save(user);
            if (notificationType === 'create') {
                await this.sendEmail(user, 'create');
            } else if (notificationType === 'update') {
                await this.sendEmail(user, 'update');
            }
        } else if (notificationType === 'delete') {
            await this.repository.delete(user);
            await this.sendEmail(user, 'delete');
            this.eventEmitter.emit('user.deleted', new UserDeletedEvent(user.id));
        }
    }
}
