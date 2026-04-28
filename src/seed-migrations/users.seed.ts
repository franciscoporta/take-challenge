import * as bcryptjs from "bcryptjs";

export interface UserSeed {
  name: string;
  surname: string;
  email: string;
  plainPassword: string;
  age: number;
  rickIds: number[];
}

export const usersSeed: UserSeed[] = [
  {
    name: "Juan",
    surname: "Pérez",
    email: "juan@mail.com",
    plainPassword: "password123",
    age: 25,
    rickIds: [1, 2, 3],
  },
  {
    name: "María",
    surname: "García",
    email: "maria@mail.com",
    plainPassword: "password456",
    age: 30,
    rickIds: [4, 5],
  },
];

export async function hashPassword(plain: string): Promise<string> {
  return bcryptjs.hash(plain, 10);
}
