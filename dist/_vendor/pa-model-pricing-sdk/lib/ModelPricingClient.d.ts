import { ModelPricingClientOptions, ModelPricingFilters, ModelPricing } from './types';
export declare class ModelPricingClient {
    private readonly options;
    private readonly modelPricingApiBaseUrl;
    private pricing;
    /** Per userId, the user's discounts keyed by the tool (operationId) they cover. */
    private userDiscounts;
    private refreshTimer;
    private userDiscountsRefreshTimer;
    private readonly defaultHeaders;
    constructor(options: ModelPricingClientOptions);
    /**
     * Loads pricing data and starts the periodic refresh scheduler.
     * Must be called and awaited before getModelPricing.
     */
    init(): Promise<void>;
    /**
     * Stops the periodic refresh scheduler.
     */
    stop(): void;
    /**
     * Returns model pricings matching the given filters from the in-memory cache.
     * Throws if pricing has not been loaded yet — call and await init() first.
     */
    getModelPricing(filters?: ModelPricingFilters): ModelPricing[];
    private loadAll;
    private loadPricing;
    private loadUserDiscounts;
    private indexUserDiscounts;
    private applyUserDiscounts;
    private applyUsdPrice;
    private applyFilters;
    private applyCreditOverrides;
    private toSuccessResponse;
    private throwIfError;
    private wrapError;
    private buildRequestHeaders;
    private _fetch;
}
