/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as admin from "../admin.js";
import type * as appointments from "../appointments.js";
import type * as auth from "../auth.js";
import type * as clients from "../clients.js";
import type * as consultations from "../consultations.js";
import type * as dashboard from "../dashboard.js";
import type * as expenses from "../expenses.js";
import type * as products from "../products.js";
import type * as reseed from "../reseed.js";
import type * as seed from "../seed.js";
import type * as seed_products from "../seed_products.js";
import type * as services from "../services.js";
import type * as suppliers from "../suppliers.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  admin: typeof admin;
  appointments: typeof appointments;
  auth: typeof auth;
  clients: typeof clients;
  consultations: typeof consultations;
  dashboard: typeof dashboard;
  expenses: typeof expenses;
  products: typeof products;
  reseed: typeof reseed;
  seed: typeof seed;
  seed_products: typeof seed_products;
  services: typeof services;
  suppliers: typeof suppliers;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
