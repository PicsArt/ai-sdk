export declare class ModelPricingClientError extends Error {
    status: number;
    details: unknown;
    constructor(action: string, status: number, responseBody: unknown);
}
