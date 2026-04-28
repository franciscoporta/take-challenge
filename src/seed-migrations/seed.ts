import { DataSource } from "typeorm";
import { config } from "dotenv";
import { User } from "../users/user.entity";
import { usersSeed, hashPassword } from "./users.seed";

config();

const dataSource = new DataSource({
  type: "mysql",
  host: process.env.HOST_DB,
  port: Number(process.env.PORT_DB),
  username: process.env.USERNAME_DB,
  password: process.env.PASSWORD_DB,
  database: process.env.NAME_DATABASE,
  entities: [User],
});

async function seed() {
  await dataSource.initialize();
  const userRepository = dataSource.getRepository(User);

  for (const userData of usersSeed) {
    const exists = await userRepository.findOneBy({ email: userData.email });

    if (exists) {
      console.log(`Skipping ${userData.email} (already exists)`);
      continue;
    }

    const { plainPassword, ...rest } = userData;
    const user = userRepository.create({
      ...rest,
      password: await hashPassword(plainPassword),
    });

    await userRepository.save(user);
    console.log(`Created ${userData.email}`);
  }

  await dataSource.destroy();
  console.log("Seed completed");
}

seed().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
