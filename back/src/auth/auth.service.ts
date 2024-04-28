import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/users/user.entity';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {

    constructor(
        private userservice : UsersService, private jwtService : JwtService,
    ) {

    }

    public async validateUser(email: string, password: string) : Promise<User> {
        const users : User[] = await this.userservice.getAllUsers();
        let user_target : User = undefined;
        users.forEach((user) => {
            if(user.email === email) {
               user_target = user;
            }
        });
        if (user_target !== undefined) {
            const goodPassword: boolean = await bcrypt.compare(password, user_target.password);
            if (goodPassword) {
                return user_target;
            }
        }
        return undefined;
    }

    public async createPassword (id : number, password : string) : Promise<string> {
        const users : User[] = await this.userservice.getAllUsers();
        let user_target : User = undefined;
        users.forEach((user) => {
            if (user.id === id) {
                user_target = user;
            }
        });
        if (user_target !== undefined) {
            if (user_target.password === undefined){
                const saltOrRounds = 10;
                const hash = await bcrypt.hash(password, saltOrRounds);
                user_target.password = hash;
            }
        }
        return user_target.password;
    }
    
    async login(user: any) {
        const payload = { username: user.id };
        return {
            access_token: this.jwtService.sign(payload),
        };
    }
}
