import { validate } from "class-validator";
import { plainToInstance } from "class-transformer";
import { createUserDto } from "src/users/dto/create-user.dto";
import { UserLoginDto } from "src/auth/dto/login-user.dto";
import { RegisterUserDto } from "src/auth/dto/register-user.dto";

describe("DTO Validation", () => {
  describe("createUserDto", () => {
    const validUser = {
      name: "Juan",
      email: "test@test.com",
      password: "Password1",
      surname: "Perez",
      age: 25,
      rickIds: [1, 2],
    };

    it("deberia pasar con datos validos", async () => {
      const dto = plainToInstance(createUserDto, validUser);
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it("deberia fallar con email invalido", async () => {
      const dto = plainToInstance(createUserDto, {
        ...validUser,
        email: "not-an-email",
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === "email")).toBe(true);
    });

    it("deberia fallar con password corta", async () => {
      const dto = plainToInstance(createUserDto, {
        ...validUser,
        password: "Ab1",
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === "password")).toBe(true);
    });

    it("deberia fallar con password sin mayuscula", async () => {
      const dto = plainToInstance(createUserDto, {
        ...validUser,
        password: "password1",
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === "password")).toBe(true);
    });

    it("deberia fallar con password sin minuscula", async () => {
      const dto = plainToInstance(createUserDto, {
        ...validUser,
        password: "PASSWORD1",
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it("deberia fallar con password sin numero", async () => {
      const dto = plainToInstance(createUserDto, {
        ...validUser,
        password: "Password",
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it("deberia fallar sin name", async () => {
      const { name, ...withoutName } = validUser;
      const dto = plainToInstance(createUserDto, withoutName);
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === "name")).toBe(true);
    });

    it("deberia fallar con age como string", async () => {
      const dto = plainToInstance(createUserDto, {
        ...validUser,
        age: "veinticinco",
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === "age")).toBe(true);
    });

    it("deberia fallar con rickIds como strings", async () => {
      const dto = plainToInstance(createUserDto, {
        ...validUser,
        rickIds: ["a", "b"],
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === "rickIds")).toBe(true);
    });
  });

  describe("UserLoginDto", () => {
    const validLogin = {
      email: "test@test.com",
      password: "validpassword",
    };

    it("deberia pasar con datos validos", async () => {
      const dto = plainToInstance(UserLoginDto, validLogin);
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it("deberia fallar con email invalido", async () => {
      const dto = plainToInstance(UserLoginDto, {
        ...validLogin,
        email: "not-email",
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === "email")).toBe(true);
    });

    it("deberia fallar con password menor a 6 caracteres", async () => {
      const dto = plainToInstance(UserLoginDto, {
        ...validLogin,
        password: "short",
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === "password")).toBe(true);
    });

    it("deberia fallar sin email", async () => {
      const dto = plainToInstance(UserLoginDto, { password: "validpassword" });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === "email")).toBe(true);
    });

    it("deberia fallar sin password", async () => {
      const dto = plainToInstance(UserLoginDto, { email: "test@test.com" });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === "password")).toBe(true);
    });
  });

  describe("RegisterUserDto", () => {
    const validRegister = {
      name: "Francisco",
      surname: "Porta",
      email: "test@test.com",
      password: "validpassword",
      age: 25,
      rickIds: [1],
    };

    it("deberia pasar con datos validos", async () => {
      const dto = plainToInstance(RegisterUserDto, validRegister);
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it("deberia fallar con name menor a 3 caracteres", async () => {
      const dto = plainToInstance(RegisterUserDto, {
        ...validRegister,
        name: "ab",
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === "name")).toBe(true);
    });

    it("deberia fallar con surname menor a 3 caracteres", async () => {
      const dto = plainToInstance(RegisterUserDto, {
        ...validRegister,
        surname: "ab",
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === "surname")).toBe(true);
    });

    it("deberia fallar con email invalido", async () => {
      const dto = plainToInstance(RegisterUserDto, {
        ...validRegister,
        email: "invalid",
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === "email")).toBe(true);
    });

    it("deberia fallar con password menor a 6 caracteres", async () => {
      const dto = plainToInstance(RegisterUserDto, {
        ...validRegister,
        password: "short",
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === "password")).toBe(true);
    });

    it("deberia fallar con age como string", async () => {
      const dto = plainToInstance(RegisterUserDto, {
        ...validRegister,
        age: "veinticinco",
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === "age")).toBe(true);
    });

    it("deberia fallar con rickIds como strings", async () => {
      const dto = plainToInstance(RegisterUserDto, {
        ...validRegister,
        rickIds: ["a"],
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === "rickIds")).toBe(true);
    });

    it("deberia fallar sin campos requeridos", async () => {
      const dto = plainToInstance(RegisterUserDto, {});
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });
  });
});
