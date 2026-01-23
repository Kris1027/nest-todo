import { AuthGuard } from '../common/guards/auth.guard';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { TodoService } from './todo.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { PaginatedTodosDto } from './dto/paginated-todos.dto';
import { FindTodosQueryDto } from './dto/find-todos-query.dto';

@ApiTags('Todos')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('todos')
export class TodoController {
  constructor(private readonly todoService: TodoService) {}

  @Post()
  create(@Body() createTodoDto: CreateTodoDto, @CurrentUser() userId: number) {
    return this.todoService.create(createTodoDto, userId);
  }

  @Get()
  @ApiOkResponse({
    description: 'Paginated list of todos',
    type: PaginatedTodosDto,
  })
  findAll(
    @Query() query: FindTodosQueryDto, // Extract all query params
    @CurrentUser() userId: number,
  ) {
    return this.todoService.findAll(userId, query);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() userId: number,
  ) {
    return this.todoService.findOne(id, userId);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTodoDto: UpdateTodoDto,
    @CurrentUser() userId: number,
  ) {
    return this.todoService.update(id, updateTodoDto, userId);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() userId: number) {
    return this.todoService.remove(id, userId);
  }
}
