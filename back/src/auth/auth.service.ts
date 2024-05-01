import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/users/user.entity';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {

    constructor(
        private userservice: UsersService, private jwtService: JwtService,
    ) {

    }

    public async validateUser(email: string, password: string): Promise<User> {
        const user: User = await this.userservice.getUserByEmail(email);
        
        if (!user) {
            throw new UnauthorizedException('Wrong email or password');
        }

        const goodPassword = await bcrypt.compare(password, user.password);
    
        if (!goodPassword) {
            throw new UnauthorizedException('Wrong email or password');
        }
        
        return user;
    }

    public async createPassword (id: number, password: string): Promise<string> {
        const user: User = await this.userservice.getUserById(id);
        if (user !== undefined) {
            if (user.password === undefined){
                const saltOrRounds = 10;
                const hash = await bcrypt.hash(password, saltOrRounds);
                user.password = hash;
            }
        }
        return user.password;
    }
    
    async login(user: any) {
        const payload = { username: user.id };
        return {
            access_token: this.jwtService.sign(payload),
        };
    }
}
