import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  UnprocessableEntityException,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { Types } from 'mongoose';
import { diskStorage } from 'multer';
import { ParseMongoObjectIdPipe } from 'src/pipes/parse-mongo-object-id.pipe';
import { CsvParser } from 'src/providers/csv-parser.provider';
import { CreateUserDto } from './dto/create-user.dto';
import { PaginatedResponseDto } from './dto/paginated-response.dto';
import { QueryUserDto } from './dto/query-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UploadUsersResponseDto } from './dto/upload-users-response.dto';
import { UsersInterceptor } from './interceptors/users.interceptor';
import { User } from './schema/user.schema';
import { UsersService } from './users.service';

@ApiTags('Users API')
@Controller('users')
@UseInterceptors(UsersInterceptor)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('/')
  @ApiOperation({ summary: `Create a new user` })
  @ApiOkResponse({ type: User, status: 201 })
  async postUsers(@Body() body: CreateUserDto): Promise<User> {
    try {
      return await this.usersService.createUser(body);
    } catch (error) {
      if (error instanceof UnprocessableEntityException) {
        throw new HttpException(
          'Email must be unique',
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      }
    }
  }

  @Get('/')
  @ApiOperation({ summary: `Return a list of users` })
  @ApiOkResponse({ type: [User] })
  async getUsers(
    @Query() query: QueryUserDto,
  ): Promise<PaginatedResponseDto<User>> {
    const { limit, page, sort, sortBy, ...filters } = query;
    const users = await this.usersService.getUsers(
      limit,
      page,
      sort,
      sortBy,
      filters,
    );

    return new PaginatedResponseDto({
      data: users,
      limit: limit,
      page: page,
      sort: sort,
      sortBy: sortBy,
    });
  }

  @Patch('/:id')
  @ApiOperation({ summary: `Update a single user` })
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({ type: User, status: 200 })
  @ApiNotFoundResponse({ type: String, status: 404 })
  @ApiInternalServerErrorResponse({ type: String, status: 500 })
  async patchUser(
    @Param('id', ParseMongoObjectIdPipe) id: Types.ObjectId,
    @Body() body: UpdateUserDto,
  ): Promise<User> {
    try {
      return await this.usersService.updateUser(id, body);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      throw new HttpException(
        'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete('/:id')
  @ApiOperation({ summary: `Soft delete a single user` })
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({ type: User })
  @ApiNotFoundResponse({ type: String, status: 404 })
  @ApiInternalServerErrorResponse({ type: String, status: 500 })
  async deleteUser(
    @Param('id', ParseMongoObjectIdPipe) id: Types.ObjectId,
  ): Promise<User> {
    try {
      return await this.usersService.deleteUser(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      throw new HttpException(
        'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('/upload')
  @ApiOkResponse({ type: UploadUsersResponseDto, status: 200 })
  @ApiUnprocessableEntityResponse({ type: String, status: 422 })
  @UseInterceptors(
    FileInterceptor('file', {
      // Allow only CSV mimetypes
      fileFilter: (req, file, callback) => {
        if (!file.mimetype?.match(/text\/csv/i)) {
          return callback(null, false);
        }
        callback(null, true);
      },
      storage: diskStorage({
        filename: function (req, file, cb) {
          cb(null, file.originalname);
        },
      }),
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async uploadUsers(
    @UploadedFile()
    file: Express.Multer.File,
  ): Promise<UploadUsersResponseDto> {
    if (!file) {
      throw new UnprocessableEntityException(
        'Uploaded file is not a CSV file.',
        String(HttpStatus.UNPROCESSABLE_ENTITY),
      );
    }

    const headerMappings = {
      firstname: 'firstName',
      lastname: 'lastName',
      email: 'email',
      phone: 'phone',
      status: 'status',
      provider: 'marketingSource',
      birth_date: 'birthDate',
    };

    const users = await CsvParser.parse(file.path, {
      mapHeaders: ({ header }) => headerMappings[header],
    });

    const result = await this.usersService.bulkInsertUsers(users);
    return new UploadUsersResponseDto({
      failedCount: result.failedCount,
      successCount: result.successCount,
    });
  }
}
