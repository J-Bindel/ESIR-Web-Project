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
        const association: Association = await this.assoRepository.create({
            userIds: userIds, 
            name: name,
            password: hash
        });
        await this.notifyComponent(association, {}, 'association create');
        return association;
     }
     
    public async setAsso(id: number, userIds: string, name: string, password: string): Promise <Association> {
        const arrayUserIds = userIds.split(',');

        for (const id of arrayUserIds) {
            const user: User = await this.userRepository.findOne({ where: { id: Equal(+id) } });
            if (!user) {
                return undefined;
            }
        }

        if (name === undefined || password === undefined) {
            return undefined;
        }

        const association: Association = await this.assoRepository.findOne({where: {id: Equal(id)}});
        if (!association) {
            return undefined;
        }

        const modifiedFields: { [key: string]: any } = {};

        if (association.userIds !== userIds) {
            modifiedFields.userIds = userIds;
            association.userIds = userIds;
        }
        if (association.name !== name) {
            modifiedFields.name = name;
            association.name = name;
        }

        const isPasswordModified = await bcrypt.compare(password, association.password);
        if (!isPasswordModified) {
            const saltOrRounds = 10;
            const hash = await bcrypt.hash(password, saltOrRounds);
            modifiedFields.password = '******';
            association.password = hash;
        }

        if (Object.keys(modifiedFields).length > 0) {
            await this.notifyComponent(association, modifiedFields, 'association update');
        }

        return association;
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
                await this.notifyComponent(assoToDelete, {}, 'association delete');
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

    private async notifyComponent(association: Association, modifiedFields: { [key: string]: any }, notificationType: string): Promise<void> {
        const notification = {
            email: '',
            association,
            modifiedFields,
            notificationType,
        };

        // Iterate over the users of the association
        const userIds = association.userIds.split(',');
        for (const userId of userIds) {
            const user = await this.userRepository.findOne({where: {id: Equal(+userId)}});
            if (user !== undefined) {
                notification.email = user.email;
                await this.producerService.addToNotificationQueue(notification);
            }
        }

        if (notificationType !== 'delete') {
            await this.assoRepository.save(association);
        }
    }
}
