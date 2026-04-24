import { INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { AppController } from "src/app.controller";
import { AppService } from "src/app.service";
import request from "supertest";

describe("AppController", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe("GET /", () => {
    it("deberia retornar Hello World!", async () => {
      const response = await request(app.getHttpServer())
        .get("/")
        .expect(200);

      expect(response.text).toBe("Hello World!");
    });
  });
});
