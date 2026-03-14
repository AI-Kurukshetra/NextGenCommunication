import { ApiKeysRepository, type ApiPrincipal } from "@/server/repositories/api-keys-repository";
import { OAuthTokensRepository } from "@/server/repositories/oauth-tokens-repository";
import { QuotaService } from "@/server/services/quota-service";
import { AppError } from "@/lib/errors";
import { checkRateLimit } from "@/lib/rate-limit";

const apiKeysRepository = new ApiKeysRepository();
const oauthTokensRepository = new OAuthTokensRepository();
const quotaService = new QuotaService();

export interface RequestPrincipal {
  organizationId: string;
  applicationId: string;
  scopes: string[];
  rateLimitPerMinute: number;
  principalType: "api_key" | "oauth_token";
  principalId: string;
}

function mapApiPrincipal(principal: ApiPrincipal): RequestPrincipal {
  return {
    organizationId: principal.organizationId,
    applicationId: principal.applicationId,
    scopes: principal.scopes,
    rateLimitPerMinute: principal.rateLimitPerMinute,
    principalType: "api_key",
    principalId: principal.keyId
  };
}

export async function authenticateApiRequest(request: Request, requiredScope?: string): Promise<RequestPrincipal> {
  const auth = request.headers.get("authorization");
  const xKey = request.headers.get("x-api-key");

  const bearerToken = auth?.startsWith("Bearer ") ? auth.slice(7) : undefined;
  const token = bearerToken ?? xKey;
  if (!token) {
    throw new AppError("Missing API key", { status: 401, code: "missing_api_key" });
  }

  let principal: RequestPrincipal | null = null;

  if (bearerToken) {
    const oauthPrincipal = await oauthTokensRepository.findActive(bearerToken);
    if (oauthPrincipal) {
      principal = {
        organizationId: oauthPrincipal.organizationId,
        applicationId: oauthPrincipal.applicationId,
        scopes: oauthPrincipal.scopes,
        rateLimitPerMinute: 180,
        principalType: "oauth_token",
        principalId: oauthPrincipal.tokenId
      };
    }
  }

  if (!principal) {
    const keyPrincipal = await apiKeysRepository.findPrincipal(token);
    if (keyPrincipal) {
      principal = mapApiPrincipal(keyPrincipal);
    }
  }

  if (!principal) {
    throw new AppError("Invalid credentials", { status: 401, code: "invalid_credentials" });
  }

  checkRateLimit(
    `${principal.principalType}:${principal.principalId}`,
    principal.rateLimitPerMinute,
    60_000
  );
  await quotaService.enforceApiRequestQuota(principal);

  if (requiredScope && !principal.scopes.includes(requiredScope) && !principal.scopes.includes("*")) {
    throw new AppError("Insufficient scope", { status: 403, code: "forbidden" });
  }

  return principal;
}
