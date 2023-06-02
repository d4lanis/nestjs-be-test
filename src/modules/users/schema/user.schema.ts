import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document;

export const USERS_COLLECTION = 'users';

@Schema({
  collection: USERS_COLLECTION,
  timestamps: true,
})
export class User {
  @ApiProperty()
  _id: Types.ObjectId;

  @ApiProperty({ required: true })
  @Prop({ required: true })
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @ApiProperty({ required: true })
  @Prop({ required: true })
  @IsNotEmpty()
  @IsString()
  lastName: string;

  @ApiProperty({ required: true })
  @Prop({ required: true, unique: true, index: true })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ required: true })
  @Prop({ required: true, unique: true, index: true })
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ required: false })
  @Prop({ required: false })
  @IsString()
  marketingSource: string;

  @ApiProperty({ required: true })
  @Prop({ type: Date, required: true })
  @IsNotEmpty()
  @IsDate()
  birthDate: Date;

  @ApiProperty({ required: false })
  @Prop({ required: false, default: null })
  status: string;

  @ApiProperty({ required: false })
  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @ApiProperty({ required: false })
  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;

  @ApiProperty({ required: false })
  @Prop({ type: Boolean })
  isDeleted: {
    type: boolean;
    default: false;
  };
}

export const UserSchema = SchemaFactory.createForClass(User);
