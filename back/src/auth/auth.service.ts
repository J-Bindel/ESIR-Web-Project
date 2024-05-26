import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '../users/user.entity';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { Association } from '../associations/association.entity';
import { AssociationsService } from '../associations/associations.service';

@Injectable()
export class AuthService {

    constructor(
        private userService: UsersService,
        private associationService: AssociationsService,
        private jwtService: JwtService,
    ) {

    }

    public async validateUser(email: string, password: string): Promise<User> {
        const user: User = await this.userService.getUserByEmail(email);
        
        if (!user) {
            throw new UnauthorizedException('Wrong email or password');
        }

        const goodPassword = await bcrypt.compare(password, user.password);
    
        if (!goodPassword) {
            throw new UnauthorizedException('Wrong email or password');
        }
        
        return user;
    }

    public async validateAssociation(id: number, password: string): Promise<boolean> {
        const association: Association = await this.associationService.getAssoById(id);

        if (!association) {
            return false;
        }

        const goodPassword = await bcrypt.compare(password, association.password);

        return goodPassword;
    }

    async userLogin(user: any) {
        const payload = { username: user.id };
        return {
            access_token: this.jwtService.sign(payload),
            user: user,
        };
    }

}
