import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "./user.entity";
import { Repository } from "typeorm";
import { updateUserDto } from "./dto/update-user.dto";
import { RickApiClient } from "src/external/rickapi/rickapi.client";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private rickClient: RickApiClient,
  ) {}

  async findAll(): Promise<User[]> {
    return await this.userRepository.find();
  }

  async findById(id: number) {
    if (!id) throw new Error("ID is required");

    const findUser = await this.userRepository.findOne({ where: { id } });

    if (!findUser) return null;

    const findRickByUser = await this.rickClient.getRickDetailsById(
      findUser.rickIds,
    );

    return { ...findUser, rick: findRickByUser };
  }

  async create(user: Partial<User>) {
    const newUser = this.userRepository.create(user);
    return await this.userRepository.save(newUser);
  }

  async update(user: Partial<updateUserDto>, id: number) {
    return await this.userRepository.update(id, user);
  }

  async delete(id: number) {
    return await this.userRepository.delete(id);
  }
}
