import { UsersService } from './users.service';
import { createUserDto } from './dto/create-user.dto';
import { updateUserDto } from './dto/update-user.dto';
import { User } from './user.entity';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    findAll(): Promise<User[]>;
    findById(id: string): Promise<{
        rick: {
            name: any;
            species: any;
        }[];
        id: number;
        name: string;
        surname: string;
        age: number;
        rickIds: number[];
    } | null>;
    create(user: createUserDto): Promise<User>;
    update(id: string, user: updateUserDto): Promise<import("typeorm").UpdateResult>;
    delete(id: string): Promise<import("typeorm").DeleteResult>;
}
