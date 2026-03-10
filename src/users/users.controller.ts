import { Body, Controller, Delete, Get, Param, Patch, Post, Query, 
    ParseIntPipe, ValidationPipe } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user-dto';
import { UpdateUserDto } from './dto/update-user-dto';

@Controller('users') //Decorator to define the route for this controller
export class UsersController {
    constructor(private usersService: UsersService) {} 

    @Get() //GET /users or /users?role=value
    findAll(@Query('role') role?: 'INTERN' | 'ADMIN' | 'ENGINEER') {
        return this.usersService.findAll(role);
    }

    @Get(':id') //GET /users/:id
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.usersService.findOne(id);
    }

    @Post() //POST /users {}Empty object.
    create(@Body(ValidationPipe) createUserDto: CreateUserDto)  {
        return this.usersService.create(createUserDto);
    }

     @Patch(':id') //PATCH /users/:id 
    update(@Param('id', ParseIntPipe) id: number, @Body(ValidationPipe) updateUserDto:UpdateUserDto) {
        return this.usersService.update(id, updateUserDto);
    }

    @Delete(':id') //Delete /users/:id
    delete(@Param('id', ParseIntPipe) id: number) {
        return this.usersService.delete(id);
    }

}
