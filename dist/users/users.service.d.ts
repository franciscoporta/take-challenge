import { User } from "./user.entity";
import { Repository } from "typeorm";
import { updateUserDto } from "./dto/update-user.dto";
export declare class UsersService {
    private userRepository;
    constructor(userRepository: Repository<User>);
    findAll(): Promise<User[]>;
    findById(id: number): Promise<User | "El usuario no existe">;
    create(user: Partial<User>): Promise<User>;
    update(user: Partial<updateUserDto>, id: number): Promise<import("typeorm").UpdateResult>;
    delete(id: number): Promise<import("typeorm").DeleteResult>;
}
