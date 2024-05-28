import { Injectable, Module } from '@nestjs/common';
import { User } from '../users/user.entity';
import { Association } from './association.entity';
import { UsersModule } from '../users/users.module';
import { Equal, Repository } from 'typeorm';
import { InjectRepository, TypeOrmModule } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { ProducerService } from '../queue/producer.service';

@Module({
    imports: [TypeOrmModule.forFeature([Association, User]),
    UsersModule],
})
@Injectable()
export class AssociationsService {
    
    constructor(
        @InjectRepository(Association)
        private assoRepository: Repository <Association>,
        @InjectRepository(User)
        private userRepository: Repository <User>,
        private producerService: ProducerService,
    ) {}
    
    public async getAllAssos(): Promise <Association[]> {
        return this.assoRepository.find();
    }

    public async getAssoById(id : number): Promise <Association> {
        return await this.assoRepository.findOne({where: {id: Equal(id)}});
     }
     
    public async create(userIds: string, name: string, password: string): Promise <Association> {
        const saltOrRounds = 10;
        const hash = await bcrypt.hash(password, saltOrRounds);
        const arrayUserIds = userIds.split(',');
        arrayUserIds.forEach(async (id) => {
            const user: User = await this.userRepository.findOne({where: {id: Equal(+id)}});
            if (user === undefined) {
                return undefined;
            }
        });
        if (name === undefined || password === undefined) {
            return undefined;
        }
        const newAssociation: Association = await this.assoRepository.create({
            userIds: userIds, 
            name: name,
            password: hash
        });
        await this.notifyComponent(newAssociation, 'create');
        return newAssociation;
     }
     
    public async setAsso(id: number, userIds: string, name: string, password: string): Promise <Association> {
        const arrayUserIds = userIds.split(',');
        arrayUserIds.forEach(async (id) => {
            const user: User = await this.userRepository.findOne({where: {id: Equal(+id)}});
            if (user === undefined) {
                return undefined;
            }
        });
        if (name === undefined || password === undefined) {
            return undefined;
        }
        const saltOrRounds = 10;
        const hash = await bcrypt.hash(password, saltOrRounds);
        const assoToUpdate: Association = await this.assoRepository.findOne({where: {id: Equal(id)}});
        if (assoToUpdate === undefined) {
            return undefined;
        }
        assoToUpdate.userIds = userIds;
        assoToUpdate.name = name;
        assoToUpdate.password = hash;
        await this.notifyComponent(assoToUpdate, 'update');
        return assoToUpdate;
    }
      
    public async deleteAsso(id: number): Promise <boolean> {
        try {
            if (typeof id !== 'number') {
                console.error('Invalid id type:', id, typeof id);
                return false;
            }
            const assoToDelete: Association = await this.getAssoById(id);
            if (!assoToDelete) {
                console.error('Association not found with id:', id);
                return false;
            }
            const result = await this.assoRepository.delete(id);
            if (result.affected > 0) {
                await this.notifyComponent(assoToDelete, 'delete');
                return result.affected > 0;
            } else {
                return false;
            }
        } catch(error) {
            console.error('Error deleting association: ', error);   
            return false;
        }
     }

     public async removeUsersDeleted(id: number): Promise<void> {
        const associations = await this.assoRepository.find();
        const userIdsStr = id.toString();

        for (const asso of associations) {
            const userIds = asso.userIds.split(',').map(id => id.trim());
            const updatedUsersId = userIds.filter(id => id !== userIdsStr);

            if (updatedUsersId.length !== userIds.length) {
                asso.userIds = updatedUsersId.join(',');
                await this.assoRepository.save(asso);
            }
        }
    }

    private async sendEmail(association: Association, emailType: string): Promise<void> {
        let subject: string;
        let html: string;

        if (emailType === 'create') {
            subject = `[French association administration service] Welcome to ${association.name}!`;
            html = `<p>Welcome to ${association.name}!</p>
                    <p>You have successfully been added to ${association.name} association.
                    <p>You will now be able to receive emails each time the association will be updated or when a new event will be created.</p>`;
        } else if (emailType === 'update') {
            subject = `[French association administration service] ${association.name} has been updated!`;
            html = `<p>${association.name} has been updated!</p>
                    <p>If the update was not emitted by one of the association members, please contact us.</p>`;
        } else if (emailType === 'delete') {
            subject = `[French association administration service] ${association.name} has been deleted!`;
            html = `<p>${association.name} has been deleted!</p>
                    <p>If you or any member of the association did not perform this operation, please contact us.</p>`;
        }

        // Iterate over the users of the association
        const userIds = association.userIds.split(',');
        for (const userId of userIds) {
            const user = await this.userRepository.findOne({where: {id: Equal(+userId)}});
            if (user !== undefined) {
                const message = {
                    email: user.email,
                    subject: subject,
                    html: html,
                };
                await this.producerService.addToEmailQueue(message);
            }
        }
    }

    private async notifyComponent(association: Association, notificationType: string): Promise<void> {
        if (notificationType !== 'delete') {
            await this.assoRepository.save(association);
            if (notificationType === 'create') {
                await this.sendEmail(association, 'create');
            } else if (notificationType === 'update') {
                await this.sendEmail(association, 'update');
            }
        } else if (notificationType === 'delete') {
            await this.sendEmail(association, 'delete');
        }
    }
}
