import { Controller, Post, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { ApiBody, ApiCreatedResponse, ApiOperation, ApiProperty, ApiTags } from '@nestjs/swagger';

export class AuthInput {

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
      type: AuthInput,
      description: "A user email and a password",
      examples: {
          a: {
              summary: "john.doe@example.com valid_password",
              description: "User example",
              value: {email: 'john.doe@example.com', password:"valid_password"} as AuthInput
          }
      }
  })
    @UseGuards(AuthGuard('local'))
    @Post('login')
    async login(@Request() request) {
      return this.authService.login(request.user);
    }
}