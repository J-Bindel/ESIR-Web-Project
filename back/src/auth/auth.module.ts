import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '../users/users.module';
import { AuthService } from './auth.service';
import { LocalStrategy } from './local.strategy';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constants';
import { JwtStrategy } from './jwt.strategy';
import { AssociationsModule } from '../associations/associations.module';

@Module({
  imports: [UsersModule, AssociationsModule, PassportModule,
  JwtModule.register({
    secret: jwtConstants.secret,
    signOptions: { expiresIn: '15 m' },
  })
],
  providers: [AuthService, LocalStrategy, JwtStrategy],
  controllers: [AuthController]

})
export class AuthModule {}
