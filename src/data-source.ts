import { DataSource } from "typeorm";
import { config } from "dotenv";
import { User } from "./users/user.entity";

config();

export default new DataSource({
  type: "mysql",
  host: process.env.HOST_DB,
  port: Number(process.env.PORT_DB),
  username: process.env.USERNAME_DB,
  password: process.env.PASSWORD_DB,
  database: process.env.NAME_DATABASE,
  entities: [User],
  migrations: [__dirname + "/migrations/*.{ts,js}"],
  migrationsTableName: "custom_migration_table",
});
