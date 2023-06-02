import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { IAppConfig } from 'config/app.config';
import { IMongoConfig } from 'config/mongo.config';
import { Model, Types } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginatedResponseSortEnum } from './interfaces/paginated-response.interface';
import { User } from './schema/user.schema';

@Injectable()
export class UsersService {
  constructor(
    private readonly configService: ConfigService<
      IAppConfig & IMongoConfig,
      true
    >,
    @InjectModel(User.name) private readonly mongooseModel: Model<User>,
  ) {}

  getModel(): Model<User> {
    return this.mongooseModel;
  }

  async getUsers(
    limit: number,
    page: number,
    sort: PaginatedResponseSortEnum,
    sortBy: string,
    filters: object,
  ): Promise<User[]> {
    return await this.mongooseModel
      .find({
        $or: [{ isDeleted: false }, { isDeleted: { $exists: false } }],
        ...filters,
      })
      .sort({ [sortBy]: sort })
      .skip((page - 1) * limit)
      .limit(limit);
  }

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const {
      firstName,
      lastName,
      email,
      marketingSource,
      phone,
      birthDate,
      status,
    } = createUserDto;

    const existUser = await this.mongooseModel.findOne({ email: email });

    if (existUser) {
      throw new UnprocessableEntityException('Email must ne unique');
    }

    const user = new this.mongooseModel({
      firstName: firstName,
      lastName: lastName,
      email: email,
      marketingSource: marketingSource,
      phone: phone,
      birthDate: birthDate,
      status: status,
      isDeleted: false,
    });
    return user.save();
  }

  async updateUser(
    id: Types.ObjectId,
    updateUserDto: UpdateUserDto,
  ): Promise<User> {
    const user = await this.mongooseModel.findOneAndUpdate(
      id,
      { ...updateUserDto },
      { new: true },
    );

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async deleteUser(id: Types.ObjectId): Promise<User> {
    const user = await this.mongooseModel.findOneAndUpdate(
      id,
      { isDeleted: true },
      { new: true },
    );

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async bulkInsertUsers(
    users,
  ): Promise<{ successCount: number; failedCount: number }> {
    try {
      const result = await this.mongooseModel.insertMany(users, {
        ordered: false,
      });

      const successCount = result.length;
      const failedCount = users.length - successCount;
      return {
        successCount: successCount,
        failedCount: failedCount,
      };
    } catch (error) {}
  }
}
