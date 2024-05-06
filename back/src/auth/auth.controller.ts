import { Controller, Post, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { ApiBody, ApiCreatedResponse, ApiOperation, ApiProperty, ApiTags } from '@nestjs/swagger';

export class UserLogin {

  @ApiProperty({
    description: 'The email of the user',
    example: 'john.doe@example.com',
    type: String,
  })
  public email: string;

  @ApiProperty({
    description: 'The password of the user',
    example: 'valid_password',
    type: String,
  })
  public password: string;

}

export class AssociationLogin {

  @ApiProperty({
    description: 'The id of the association',
    example: 1,
    type: Number,
  })
  public id: number;

  @ApiProperty({
    description: 'The password of the association',
    example: 'valid_password',
    type: String,
  })
  public password: string;

}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor (
    private authService : AuthService
  ){}
    @ApiOperation({ summary: 'Authenticate a user'})
    @ApiCreatedResponse({
      status: 200,
      description : 'The user has been successfully authenticated.'
    })
    @ApiBody({
      type: UserLogin,
      description: "A user email and a password",
      examples: {
          a: {
              summary: "john.doe@example.com valid_password",
              description: "User example",
              value: {email: 'john.doe@example.com', password:"valid_password"}
          }
      }
    })
    @UseGuards(AuthGuard('local'))
    @Post('user/login')
    async userLogin(@Request() request) {
      return this.authService.userLogin(request.user);
    }

    @UseGuards(AuthGuard('jwt'))
    @ApiOperation({ summary: 'Authenticate a user to edit association'})
    @ApiCreatedResponse({
      status: 200,
      description : 'The user has been successfully authenticated to modify the association.'
    })
    @ApiBody({
      type: AssociationLogin,
      description: "An association id and a password",
      examples: {
          a: {
              summary: "1 valid_password",
              description: "Association id and password pair example",
              value: {email: 1 , password:"valid_password"}
          }
      }
  })
    @Post('association/login')
    async associationLogin(@Request() request) {
      const {id, password} = request.association;
      const isPasswordGood = this.authService.validateAssociation(request.association.id, request.association.password);
      return { isPasswordGood };
    }
}