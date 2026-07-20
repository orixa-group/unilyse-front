import "server-only";

import { setAuthTokenGetter } from "@/lib/auth/auth-token-bridge";
import { getRequestAuthToken } from "@/lib/auth/request-auth-context.server";

setAuthTokenGetter(getRequestAuthToken);
