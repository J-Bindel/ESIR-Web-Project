import { Module } from '@nestjs/common';
import { AssociationsModule } from './associations/associations.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { PrometheusModule } from "@willsoto/nestjs-prometheus";

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'database',
      port: 3306,
      username: 'root',
      password: 'admin',
      database: 'fr_administration_database',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),
    UsersModule, AssociationsModule, AuthModule, EventEmitterModule.forRoot(), PrometheusModule.register()],
  controllers: [],
  providers: [],
})
export class AppModule {}
