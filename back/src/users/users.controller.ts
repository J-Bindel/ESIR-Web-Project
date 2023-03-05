import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Post, Put, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiBody, ApiCreatedResponse, ApiOperation, ApiParam, ApiProperty, ApiResponse, ApiTags } from '@nestjs/swagger';
import { User } from './user.entity';
import { UsersService } from './users.service';

export class UserInput {

    @ApiProperty({
        description : 'The firstname of the user',
        example : "John",
        type : String,
    })
    public firstname : string;

    @ApiProperty({
        description : 'The lastname of the user',
        example : "Dupont",
        type : String,
    })
    public lastname: string;

    @ApiProperty ({
        description : 'The age of the user',
        minimum : 18,
        default : 18,
        type : Number,
    })
    public age : number;

    @ApiProperty({
        description:' The password of the user',
        example:"secret",
        type: String,
    })
    public password : string;
}

@ApiBearerAuth()
@ApiTags('users')
@Controller('users')
export class UsersController {
    
    constructor(
        private service : UsersService
    ){}

    @Get()
    public async getAllUsers() : Promise <User[]> {
        return await this.service.getAllUsers();
    }

    @UseGuards(AuthGuard('jwt'))
    @ApiOperation({ summary: 'Get a user'})
    @ApiResponse({
        status: 200,
        description: 'The found record',
        type: UserInput,
    })
    @ApiParam({
        name: 'identifier', required: true, description: 'an integer of a user id',
        allowEmptyValue: false
    })
    @Get(':id')
    public async getUserById(@Param() parameter) : Promise <User> {
        const id : number = parameter.id;
        const user_target : User = await this.service.getUserById(id);
        if(user_target === undefined) {
            throw new HttpException(`Could not find a valid user with id : ${id}`, HttpStatus.NOT_FOUND);
        }
        return user_target;
    }

    @UseGuards(AuthGuard('jwt'))
    @ApiOperation({summary: 'Create a user'}) 
    @ApiCreatedResponse({
        status: 200,
        description : 'The user has been successfully created.'
    })
    @ApiBody({
        type: UserInput,
        description: "A user with a firstname, a lastname, an age and a password",
        examples: {
            a: {
                summary: "Jean Dupond",
                description: "User example",
                value: {firstname: "Jean", lastname: "Dupond", age: 23, password:"valid_password"} as UserInput
            }
        }
    })
    @Post()
    public async create(@Body() input : UserInput) : Promise <User> {
        return await this.service.create(input.firstname, input.lastname, input.age, input.password);
    }
    
    @UseGuards(AuthGuard('jwt'))
    @ApiBody({
        type: UserInput,
        description: "A user with a firstname, a lastname, an age and a password",
        examples: {
            a: {
                summary: "Jean Dupond",
                description: "User example",
                value: {firstname: "Jean", lastname: "Dupond", age: 23, password:"valid_password"} as UserInput
            }
        }
    })
    @ApiResponse({
        status: 200,
        description: 'The user to set',
        type: UserInput,
    })
    @ApiParam({
        name: 'identifier', required: true, description: 'an integer of a user id',
        allowEmptyValue: false
    })
    @Put(':id')
    public async setUser(@Param() parameter, @Body() input : any) : Promise <User> {
        const id : number = parameter.id;
        const user_target : User = await this.service.getUserById(id);
        if(user_target === undefined) {
            throw new HttpException(`Could not find a valid user with id : ${id}`, HttpStatus.NOT_FOUND);
        }
        
        return this.service.setUser(id, input.firstname, input.lastname, input.age, input.password);
        }    

    @UseGuards(AuthGuard('jwt'))
    @ApiBody({
        type: UserInput,
        description: "A user with a firstname, a lastname, an age and a password",
        examples: {
            a: {
                summary: "Jean Dupond",
                description: "User example",
                value: {firstname: "Jean", lastname: "Dupond", age: 23, password:"valid_password"} as UserInput
            }
        }
    })
    @ApiResponse({
        status: 200,
        description: 'The user to delete',
        type: UserInput,
    })
    @ApiParam({
        name: 'identifier', required: true, description: 'an integer of a user id',
        allowEmptyValue: false
    })
    @Delete(':id') 
    public async deleteUser(@Param() parameter) : Promise <boolean> {
        const id : number = parameter.id;
        const user_target : User = await this.service.getUserById(id);
        if(user_target === undefined) {
            throw new HttpException(`Could not find a valid user with id : ${id}`, HttpStatus.NOT_FOUND);
        }
        
        return await this.service.deleteUser(id);
    }
}