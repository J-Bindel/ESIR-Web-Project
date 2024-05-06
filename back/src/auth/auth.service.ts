import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/users/user.entity';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { Association } from 'src/associations/association.entity';
import { AssociationsService } from 'src/associations/associations.service';

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

    public async validateAssociation(id: number, password: string): Promise<Association> {
        const association: Association = await this.associationService.getAssoById(id);

        if (!association) {
            throw new UnauthorizedException('Wrong id or password');
        }

        const goodPassword = await bcrypt.compare(password, association.password);

        if (!goodPassword) {
            throw new UnauthorizedException('Wrong id or password');
        }

        return association;
    }

    async userLogin(user: any) {
        const payload = { username: user.id };
        return {
            access_token: this.jwtService.sign(payload),
        };
    }

}
