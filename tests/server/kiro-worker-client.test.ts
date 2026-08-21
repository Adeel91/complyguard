import {
  afterEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import {
  KiroWorkerError,
  requestKiroWorker,
} from "@/server/kiro-worker-client";

const originalWorkerUrl =
  process.env.KIRO_WORKER_URL;

const originalWorkerToken =
  process.env.KIRO_WORKER_TOKEN;

afterEach(() => {
  vi.unstubAllGlobals();

  if (originalWorkerUrl === undefined) {
    delete process.env.KIRO_WORKER_URL;
  } else {
    process.env.KIRO_WORKER_URL =
      originalWorkerUrl;
  }

  if (originalWorkerToken === undefined) {
    delete process.env.KIRO_WORKER_TOKEN;
  } else {
    process.env.KIRO_WORKER_TOKEN =
      originalWorkerToken;
  }
});

describe(
  "Kiro worker client",
  () => {
    it(
      "requires worker configuration",
      async () => {
        delete process.env.KIRO_WORKER_URL;
        delete process.env.KIRO_WORKER_TOKEN;

        await expect(
          requestKiroWorker({
            repositoryUrl:
              "https://github.com/example/project",
            frameworks: [
              "gdpr",
            ],
            maxRisks: 1,
          }),
        ).rejects.toMatchObject({
          status: 503,
        });
      },
    );

    it(
      "sends the worker secret only in the Authorization header",
      async () => {
        process.env.KIRO_WORKER_URL =
          "https://worker.example.com";

        process.env.KIRO_WORKER_TOKEN =
          "worker-secret";

        const fetchMock =
          vi.fn().mockResolvedValue(
            new Response(
              JSON.stringify({
                review: {
                  reviews: [],
                },
              }),
              {
                status: 200,
                headers: {
                  "Content-Type":
                    "application/json",
                },
              },
            ),
          );

        vi.stubGlobal(
          "fetch",
          fetchMock,
        );

        await requestKiroWorker({
          repositoryUrl:
            "https://github.com/example/project",
          frameworks: [
            "gdpr",
            "soc2",
          ],
          maxRisks: 2,
        });

        expect(
          fetchMock,
        ).toHaveBeenCalledTimes(
          1,
        );

        const [
          url,
          options,
        ] =
          fetchMock.mock.calls[0];

        expect(
          String(url),
        ).toBe(
          "https://worker.example.com/deep-review",
        );

        expect(
          options.headers.Authorization,
        ).toBe(
          "Bearer worker-secret",
        );

        expect(
          options.body,
        ).not.toContain(
          "worker-secret",
        );
      },
    );

    it(
      "propagates safe worker errors",
      async () => {
        process.env.KIRO_WORKER_URL =
          "https://worker.example.com";

        process.env.KIRO_WORKER_TOKEN =
          "worker-secret";

        vi.stubGlobal(
          "fetch",
          vi.fn().mockResolvedValue(
            new Response(
              JSON.stringify({
                error:
                  "A Kiro Deep Review is already running. Please try again shortly.",
              }),
              {
                status: 429,
                headers: {
                  "Content-Type":
                    "application/json",
                },
              },
            ),
          ),
        );

        try {
          await requestKiroWorker({
            repositoryUrl:
              "https://github.com/example/project",
            frameworks: [
              "gdpr",
            ],
            maxRisks: 1,
          });

          throw new Error(
            "Expected request to fail.",
          );
        } catch (error) {
          expect(
            error,
          ).toBeInstanceOf(
            KiroWorkerError,
          );

          expect(
            error,
          ).toMatchObject({
            status: 429,
          });
        }
      },
    );
  },
);
