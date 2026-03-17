import { User } from "./user.entity";
import { Repository } from "typeorm";
import { updateUserDto } from "./dto/update-user.dto";
import { PokeApiClient } from "src/external/pokeapi/pokeapi.client";
export declare class UsersService {
    private userRepository;
    private pokemonClient;
    constructor(userRepository: Repository<User>, pokemonClient: PokeApiClient);
    findAll(): Promise<User[]>;
    findById(id: number): Promise<"El usuario no existe" | {
        pokemon: any;
        id: number;
        name: string;
        surname: string;
        age: number;
        pokemonIds: number[];
    } | null>;
    create(user: Partial<User>): Promise<User>;
    update(user: Partial<updateUserDto>, id: number): Promise<import("typeorm").UpdateResult>;
    delete(id: number): Promise<import("typeorm").DeleteResult>;
}
