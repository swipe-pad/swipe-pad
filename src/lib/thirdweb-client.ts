import { createThirdwebClient } from "thirdweb";

/**
 * Shared thirdweb client instance for the entire app
 */
export const client = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID!,
});
