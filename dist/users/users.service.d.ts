import { User } from "./user.entity";
import { Repository } from "typeorm";
import { updateUserDto } from "./dto/update-user.dto";
import { RickApiClient } from "src/external/rickapi/rickapi.client";
export declare class UsersService {
    private userRepository;
    private rickClient;
    constructor(userRepository: Repository<User>, rickClient: RickApiClient);
    findAll(): Promise<User[]>;
    findById(id: number): Promise<{
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
    create(user: Partial<User>): Promise<User>;
    update(user: Partial<updateUserDto>, id: number): Promise<import("typeorm").UpdateResult>;
    delete(id: number): Promise<import("typeorm").DeleteResult>;
}
