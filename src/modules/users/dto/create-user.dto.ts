import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';
import { User } from '../schema/user.schema';

export class CreateUserDto extends User {
  @ApiProperty({ example: 'Daniel', required: true })
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Alanis', required: true })
  @IsNotEmpty()
  @IsString()
  lastName: string;

  @ApiProperty({ example: 'dalanis@nestjs.com', required: true })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ example: '(555) 555-5555', required: true })
  @IsNotEmpty()
  @Matches(/^\(\d{3}\) \d{3}[-\s]\d{4}$/, {
    message: 'Invalid phone number format',
  })
  phone: string;

  @ApiProperty({ example: 'Facebook', required: false })
  @IsOptional()
  @IsNotEmpty()
  marketingSource: string;

  @ApiProperty({ example: 'Converted', required: false })
  @IsOptional()
  @IsNotEmpty()
  status: string;

  @ApiProperty({
    required: true,
  })
  @IsDateString()
  birthDate: Date;

  constructor(args?: Partial<CreateUserDto>) {
    super();
    Object.assign(this, args);
  }
}
