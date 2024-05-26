import { Injectable, Module } from '@nestjs/common';
import { User } from '../users/user.entity';
import { Association } from './association.entity';
import { UsersModule } from '../users/users.module';
import { Equal, Repository } from 'typeorm';
import { InjectRepository, TypeOrmModule } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';

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
        private userRepository: Repository <User>
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
        await this.assoRepository.save(newAssociation);
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
        const asso: Association = await this.assoRepository.findOne({where: {id: Equal(id)}});
        if (asso === undefined) {
            return undefined;
        }
        asso.userIds = userIds;
        asso.name = name;
        asso.password = hash;
        await this.assoRepository.save(asso);
        return asso;
    }
      
    public async deleteAsso(id: number): Promise <boolean> {
        try {
            if (typeof id !== 'number') {
                console.error('Invalid id type:', id, typeof id);
                return false;
              }
            const result = await this.assoRepository.delete(id);
            return result.affected > 0;
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
}
