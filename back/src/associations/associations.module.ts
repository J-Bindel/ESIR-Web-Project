import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../users/users.module';
import { Association } from './association.entity';
import { AssociationsController } from './associations.controller';
import { AssociationsService } from './associations.service';
import { User } from '../users/user.entity';
import { AssociationListener } from './association.listener';
import { EmailModule } from '../email/email.module';

@Module({
    imports : [TypeOrmModule.forFeature([User, Association]), UsersModule, EmailModule],
    controllers:[AssociationsController],
    providers: [AssociationsService, AssociationListener],
    exports: [AssociationsService]
})
export class AssociationsModule {}
