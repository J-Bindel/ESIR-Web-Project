import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'src/users/users.module';
import { Association } from './association.entity';
import { AssociationsController } from './associations.controller';
import { AssociationsService } from './associations.service';

@Module({
    imports : [TypeOrmModule.forFeature([Association]), UsersModule],
    controllers:[AssociationsController],
    providers: [AssociationsService],
    exports: [AssociationsService]
})
export class AssociationsModule {}
