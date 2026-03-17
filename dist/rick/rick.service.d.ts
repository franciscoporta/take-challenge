import { RickApiClient } from "src/external/rickapi/rickapi.client";
export declare class RickService {
    private readonly rickApi;
    constructor(rickApi: RickApiClient);
    findAll(): Promise<any>;
}
