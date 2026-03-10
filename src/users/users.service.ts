 import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user-dto';
import { UpdateUserDto } from './dto/update-user-dto';
 import { NotFoundException } from '@nestjs/common';

@Injectable()
export class UsersService {
    private users = [
        {
            "id": 1,
            "name": "Andile Chonco",
            "email": "andile.chonco@example.com",
            "role": "INTERN"
        },
        {
            "id": 2,
            "name": "Thandi Nkambule",
            "email": "thandi.nkambule@example.com",
            "role": "ADMIN"
        },
        {
            "id": 3,
            "name": "Sipho Dlamini",
            "email": "sipho.dlamini@example.com",
            "role": "ENGINEER"
        },
        {
            "id": 4,
            "name": "Bongi Mthembu",
            "email": "bongi.mthembu@example.com",
            "role": "ENGINEER"
        },
        {
            "id": 5,
            "name": "Lindiwe Zulu",
            "email": "lindiwe.zulu@example.com",
            "role": "ADMIN"
        }
    ]

    findAll(role?: 'INTERN' | 'ADMIN' | 'ENGINEER') {
        if (role) {
            const rolesArray = this.users.filter(user => user.role === role);
            if(rolesArray.length === 0) throw new NotFoundException('User Role Not Found');
            return rolesArray;
        }

        return this.users;
    }

    findOne(id: number) {
        const user = this.users.find(user => user.id === id);

        if (!user) throw new NotFoundException("User not found");

        return user;
    }
        
    create(createUserDto: CreateUserDto) 
        {
            const usersByHighestId = [...this.users].sort((a,b) => b.id - a.id)
            const newUser = {
                id: usersByHighestId[0].id + 1,
                ...createUserDto
            }
            this.users.push(newUser);
            return newUser;
    }

    update(id: number, updateUserDto: UpdateUserDto) {
            this.users = this.users.map(user => {
                if (user.id === id) {
                    return {...user, ...updateUserDto}
                }
                return user;
            })
        return this.findOne(id)
    }
    
    delete(id: number) {
        const removedUser = this.findOne(id);

        this.users = this.users.filter(user => user.id !== id);
        return removedUser;
    }
}
