import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockApiFetch } = vi.hoisted(() => ({
  mockApiFetch: vi.fn(),
}));

vi.mock("@/lib/services/api-service", () => ({
  ApiService: {
    apiFetch: mockApiFetch,
  },
}));

import { ApiError, apiJson, MAX_RESPONSE_BYTES } from "@/lib/services/api-client";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

describe("apiJson", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("uses nested FastAPI detail messages for structured route errors", async () => {
    mockApiFetch.mockResolvedValueOnce(
      jsonResponse(
        {
          detail: {
            code: "ONE_EMAIL_KYC_TEMPORARILY_UNAVAILABLE",
            message: "One email KYC is temporarily unavailable. Please try again in a moment.",
          },
        },
        503
      )
    );

    await expect(apiJson("/api/one/kyc/workflows")).rejects.toMatchObject({
      name: "ApiError",
      status: 503,
      message: "One email KYC is temporarily unavailable. Please try again in a moment.",
    } satisfies Partial<ApiError>);
  });

  it("falls back to the status code when the error payload has no readable message", async () => {
    mockApiFetch.mockResolvedValueOnce(jsonResponse({ detail: { retryable: true } }, 500));

    await expect(apiJson("/api/one/kyc/workflows")).rejects.toMatchObject({
      message: "Request failed: 500",
    });
  });
});

// ---------------------------------------------------------------------------
// apiJson — response size boundary enforcement (CWE-400)
// ---------------------------------------------------------------------------

describe("apiJson — MAX_RESPONSE_BYTES Content-Length guard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  function responseWithContentLength(
    body: unknown,
    status: number,
    contentLength: number | null
  ): Response {
    const serialised = JSON.stringify(body);

    const headers: Record<string, string> = {
      "content-type": "application/json",
    };

    if (contentLength !== null) {
      headers["content-length"] = String(contentLength);
    }

    return new Response(serialised, { status, headers });
  }

  it("throws ApiError when Content-Length exceeds MAX_RESPONSE_BYTES", async () => {
    const oversizeBytes = MAX_RESPONSE_BYTES + 1;

    mockApiFetch.mockResolvedValueOnce(
      responseWithContentLength({ data: "truncated" }, 200, oversizeBytes)
    );

    await expect(apiJson("/api/data")).rejects.toMatchObject({
      name: "ApiError",
      message: expect.stringContaining(String(oversizeBytes)),
    } satisfies Partial<ApiError>);
  });

  it("throws ApiError with the correct response status when size limit exceeded", async () => {
    mockApiFetch.mockResolvedValueOnce(
      responseWithContentLength({ data: "x" }, 200, MAX_RESPONSE_BYTES + 1024)
    );

    await expect(apiJson("/api/data")).rejects.toMatchObject({
      status: 200,
    } satisfies Partial<ApiError>);
  });

  it("allows response exactly at MAX_RESPONSE_BYTES boundary", async () => {
    mockApiFetch.mockResolvedValueOnce(
      responseWithContentLength({ ok: true }, 200, MAX_RESPONSE_BYTES)
    );

    await expect(apiJson("/api/data")).resolves.toEqual({ ok: true });
  });

  it("allows response well within MAX_RESPONSE_BYTES", async () => {
    mockApiFetch.mockResolvedValueOnce(
      responseWithContentLength({ result: "small" }, 200, 512)
    );

    await expect(apiJson("/api/data")).resolves.toEqual({ result: "small" });
  });

  it("skips size check when Content-Length header is absent", async () => {
    mockApiFetch.mockResolvedValueOnce(
      responseWithContentLength({ result: "no-length" }, 200, null)
    );

    await expect(apiJson("/api/data")).resolves.toEqual({ result: "no-length" });
  });

  it("skips size check when Content-Length is not a valid number", async () => {
    const res = new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: {
        "content-type": "application/json",
        "content-length": "not-a-number",
      },
    });

    mockApiFetch.mockResolvedValueOnce(res);

    await expect(apiJson("/api/data")).resolves.toEqual({ ok: true });
  });
});
