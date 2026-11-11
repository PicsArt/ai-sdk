import { UserDiscount } from './types';
/** Where and for what a price is requested. */
export interface DiscountContext {
    /** App id (not the bundle id) the price is requested from. */
    appId?: string;
    touchpoint?: string;
    /** Requested duration in seconds (tools priced per second). */
    duration?: number;
}
/**
 * Whether the discount applies where the price is requested: an empty applicableIn applies everywhere; an entry
 * without an appId applies in every app, one without touchpoints on every touchpoint. An app-bound entry needs the
 * request's appId, as without one the request can't show it comes from that app. Wallets are not matched here: a
 * price request names no wallet, so the service charging the generation applies them. Mirrors the pricing service.
 */
export declare function matchesApplicableIn({ applicableIn }: Pick<UserDiscount, 'applicableIn'>, { appId, touchpoint }: DiscountContext): boolean;
/**
 * Whether the request is eligible for the discount: a duration-capped discount applies only to a request stating a
 * duration within the cap, as a request without one can't show it is. Mirrors the pricing service's rule.
 */
export declare function matchesConditions({ conditions }: Pick<UserDiscount, 'conditions'>, { duration }: DiscountContext): boolean;
