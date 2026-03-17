import { ConfigService } from "@nestjs/config";
import { HttpService } from "@nestjs/axios";
export declare class RickApiClient {
    private readonly http;
    private readonly config;
    constructor(http: HttpService, config: ConfigService);
    baseUrl: string;
    getRick(): Promise<any>;
    getRickById(id: number): Promise<any>;
    getRickDetailsById(ids: number[]): Promise<{
        name: any;
        species: any;
    }[]>;
}
