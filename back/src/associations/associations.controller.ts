import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Post, Put, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiBody, ApiCreatedResponse, ApiOperation, ApiParam, ApiProperty, ApiResponse, ApiTags } from '@nestjs/swagger';
import { User } from 'src/users/user.entity';
import { Association } from './association.entity';
import { AssociationsService } from './associations.service';

export class AssociationInput {
    @ApiProperty({
        description : 'The IDs of the users being part of the association',
        example : [1,2,3],
        type : Array<Number>,
    })
    public idUsers : number[];
    @ApiProperty({
        description : 'The name of the association',
        example : "BDE ESIR",
        type : String,
    })
    public name : string;
}

@ApiBearerAuth()
@ApiTags('associations')
@Controller('associations')
export class AssociationsController {

    constructor(
        private service : AssociationsService
    ){}

    @UseGuards(AuthGuard('jwt'))
    @Get()
    public async getAllAssos() : Promise <Association[]> {
        return await this.service.getAllAssos();
    }

    @ApiResponse({
        status: 200,
        description: 'The association to get',
        type: AssociationInput,
    })
    @ApiParam({
        name: 'identifier', required: true, description: 'an integer of an association id',
        allowEmptyValue: false,
        examples: {
            a: {
                summary: "Warner Compagny",
                description: "Get the association corresponding to the id 1",
                value: "1"
            },
        }
    })
    @Get(':id')
    public async getAssoById(@Param() parameter) : Promise <Association> {
        const id : number = parameter.id;
        const asso_target : Association = await this.service.getAssoById(id);
        if(asso_target === undefined) {
            throw new HttpException(`Could not find a valid association with id : ${id}`, HttpStatus.NOT_FOUND);
        }
        return asso_target;
    }

    @UseGuards(AuthGuard('jwt'))
    @ApiOperation({summary: 'Create an association'}) 
    @ApiCreatedResponse({
        status: 200,
        description : 'The association has been successfully created.'
    })
    @ApiBody({
        type: AssociationInput,
        description: "An association with an array of UserIds and an name",
        examples: {
            a: {
                summary: "21st century Fox",
                description: "Association example",
                value: {idUsers:[1,2,3,4], name: "21st century Fox"} as AssociationInput
            }
        }
    })
    @Post()
    public async create(@Body() input : AssociationInput) : Promise <Association> {
        return await this.service.create(input.idUsers, input.name);
    }
    
    @UseGuards(AuthGuard('jwt'))
    @ApiBody({
        type: AssociationInput,
        description: "An with an array of Users and a name",
        examples: {
            a: {
                summary: "Warner Compagny",
                description: "Association example",
                value: {idUsers: [1,2,3,4], name: "Universal"} as AssociationInput
            }
        }
    })
    @ApiResponse({
        status: 200,
        description: 'The association to set',
        type: AssociationInput,
    })
    @ApiParam({
        name: 'identifier', required: true, description: 'an integer of an association id',
        allowEmptyValue: false,
        examples: {
            a: {
                summary: "Warner Compagny",
                description: "Set the association corresponding to the id 1",
                value: "1"
            },
        }
    })
    @Put(':id')
    public async setAsso(@Param() parameter, @Body() input : any) : Promise <Association> {
        const id : number = parameter.id;
        const asso_target : Association = await this.service.getAssoById(id);
        if(asso_target === undefined) {
            throw new HttpException(`Could not find a valid association with id : ${id}`, HttpStatus.NOT_FOUND);
        }
        
        return await this.service.setAsso(id, input.idUsers, input.name);

        }    

    @UseGuards(AuthGuard('jwt'))
    @ApiBody({
        type: AssociationInput,
        description: "An with an array of Users and a name",
        examples: {
            a: {
                summary: "Warner Compagny",
                description: "Association example",
                value: {idUsers: [1,2,3,4], name: "Universal"} as AssociationInput
            }
        }
    })
    @ApiResponse({
        status: 200,
        description: 'The association to delete',
        type: AssociationInput,
    })
    @ApiParam({
        name: 'identifier', required: true, description: 'an integer of an association id',
        allowEmptyValue: false,
        examples: {
            a: {
                summary: "Warner Compagny",
                description: "Delete the association corresponding to the id 1",
                value: "1"
            },
        }
    })
    @Delete(':id') 
    public async deleteAsso(@Param() parameter) : Promise <boolean> {
        const id : number = parameter.id;
        const asso_target : Association = await this.service.getAssoById(id);
        if(asso_target === undefined) {
            throw new HttpException(`Could not find a valid association with id : ${id}`, HttpStatus.NOT_FOUND);
        }
        
        return this.service.deleteAsso(id);
    }

    @ApiResponse({
        status: 200,
        description: 'The users from the assocation',
        type: AssociationInput,
    })
    @ApiParam({
        name: 'identifier', required: true, description: 'an integer of an association',
        allowEmptyValue: false,
        examples: {
            a: {
                summary: "Warner Compagny",
                description: "Get users corresponding to the id 1 of the association",
                value: "1"
            },
        }
    })
    @Get(':id/members')
    public async getMembers(@Param() parameter): Promise <User[]> {
        const id : number = parameter.id;
        return await this.service.getMembers(id);
    }
    
}
