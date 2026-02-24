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
import type * as donations from "../donations.js";
import type * as projects from "../projects.js";
import type * as routeId from "../routeId.js";
import type * as syncAll from "../syncAll.js";
import type * as syncHypercerts from "../syncHypercerts.js";
import type * as syncKarmaGap from "../syncKarmaGap.js";
import type * as syncTalentProtocol from "../syncTalentProtocol.js";
import type * as users from "../users.js";
import type * as waitlist from "../waitlist.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  admin: typeof admin;
  donations: typeof donations;
  projects: typeof projects;
  routeId: typeof routeId;
  syncAll: typeof syncAll;
  syncHypercerts: typeof syncHypercerts;
  syncKarmaGap: typeof syncKarmaGap;
  syncTalentProtocol: typeof syncTalentProtocol;
  users: typeof users;
  waitlist: typeof waitlist;
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
