import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Post, Put, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiBody, ApiCreatedResponse, ApiOperation, ApiParam, ApiProperty, ApiResponse, ApiTags } from '@nestjs/swagger';
import { User } from 'src/users/user.entity';
import { Association } from './association.entity';
import { AssociationsService } from './associations.service';

export class AssociationInput {
    @ApiProperty({
        description: 'The IDs of the users being part of the association',
        example: "1,2,3",
        type: String,
    })
    public userIds: string;
    @ApiProperty({
        description: 'The name of the association',
        example: "BDE ESIR",
        type: String,
    })
    public name: string;

    @ApiProperty({
        description: 'The password of the association',
        example: "valid_password",
        type: String,
    })
    public password: string;
}

@ApiBearerAuth()
@ApiTags('associations')
@Controller('associations')
export class AssociationsController {

    constructor(
        private service: AssociationsService
    ){}

    @UseGuards(AuthGuard('jwt'))
    @Get()
    public async getAllAssos(): Promise <Association[]> {
        return await this.service.getAllAssos();
    }

    @ApiResponse({
        status: 200,
        description: 'The association to get',
        type: AssociationInput,
    })
    @ApiParam({ name: 'id', description: 'Association ID', type: 'integer' })
    @Get(':id')
    public async getAssoById(@Param() parameter): Promise <Association> {
        const id: number = parameter.id;
        const asso_target: Association = await this.service.getAssoById(id);
        if(asso_target === undefined) {
            throw new HttpException(`Could not find a valid association with id : ${id}`, HttpStatus.NOT_FOUND);
        }
        return asso_target;
    }

    @UseGuards(AuthGuard('jwt'))
    @ApiOperation({summary: 'Create an association'}) 
    @ApiCreatedResponse({
        status: 200,
        description: 'The association has been successfully created.'
    })
    @ApiBody({
        type: AssociationInput,
        description: "An association with an array of UserIds, a name and a password",
        examples: {
            a: {
                summary: "21st century Fox",
                description: "Association example",
                value: {userIds:"1,2,3,4", name: "21st century Fox", password: "valid_password"} as AssociationInput
            }
        }
    })
    @Post()
    public async create(@Body() input: AssociationInput): Promise <Association> {
        return await this.service.create(input.userIds, input.name, input.password);
    }
    
    @UseGuards(AuthGuard('jwt'))
    @ApiBody({
        type: AssociationInput,
        description: "An association with an array of User, a name and a password",
        examples: {
            a: {
                summary: "Warner Compagny",
                description: "Association example",
                value: {userIds: "1,2,3,4", name: "Universal", password: "valid_password"} as AssociationInput
            }
        }
    })
    @ApiResponse({
        status: 200,
        description: 'The association to set',
        type: AssociationInput,
    })
    @ApiParam({ name: 'id', description: 'Association ID', type: 'integer' })
    @Put(':id')
    public async setAsso(@Param() parameter, @Body() input: any): Promise <Association> {
        const id: number = parameter.id;
        const asso_target: Association = await this.service.getAssoById(id);
        if(asso_target === undefined) {
            throw new HttpException(`Could not find a valid association with id : ${id}`, HttpStatus.NOT_FOUND);
        }
        
        return await this.service.setAsso(id, input.userIds, input.name, input.password);

        }    

    @UseGuards(AuthGuard('jwt'))
    @ApiParam({ name: 'id', description: 'Association ID', type: 'integer' })
    @ApiResponse({
        status: 200,
        description: 'The association to delete',
        type: AssociationInput,
    })
    @Delete(':id') 
    public async deleteAsso(@Param() parameter): Promise <boolean> {
        const id: number = parameter.id;
        const asso_target: Association = await this.service.getAssoById(id);
        if(asso_target === undefined) {
            throw new HttpException(`Could not find a valid association with id : ${id}`, HttpStatus.NOT_FOUND);
        }
        
        return this.service.deleteAsso(id);
    }
    
}
