import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiProperty({ example: 'Daniel', required: false })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Alanis', required: false })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  lastName: string;

  @ApiProperty({ example: 'dalanis@nestjs.com', required: false })
  @IsOptional()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ example: '(555) 555-5555', required: false })
  @IsOptional()
  @IsNotEmpty()
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
    required: false,
  })
  @IsDateString()
  birthDate: Date;

  constructor(args?: Partial<CreateUserDto>) {
    super();
    Object.assign(this, args);
  }
}
