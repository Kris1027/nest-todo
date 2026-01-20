import { AuthGuard } from '../common/guards/auth.guard';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { TodoService } from './todo.service';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';

@UseGuards(AuthGuard)
@Controller('todos')
export class TodoController {
  constructor(private readonly todoService: TodoService) {}

  @Post()
  create(@Body() createTodoDto: CreateTodoDto, @Request() req) {
    return this.todoService.create(createTodoDto, req.user.sub as number);
  }

  @Get()
  findAll(@Request() req) {
    return this.todoService.findAll(req.user.sub as number);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.todoService.findOne(id, req.user.sub as number);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTodoDto: UpdateTodoDto,
    @Request() req,
  ) {
    return this.todoService.update(id, updateTodoDto, req.user.sub as number);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.todoService.remove(id, req.user.sub as number);
  }
}
