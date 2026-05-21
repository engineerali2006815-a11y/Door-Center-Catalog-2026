import { describe, it, expect, beforeEach, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "test",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };

  return ctx;
}

describe("orders router", () => {
  it("should list orders from database", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.orders.list();
    expect(Array.isArray(result)).toBe(true);
  });

  it("should save orders to database with correct passcode", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const testOrders = [
      {
        id: "test-order-1",
        customerName: "أحمد محمد",
        location: "الرياض",
        doorsCount: 5,
        orderDate: "2026-05-19",
        installationDate: "2026-05-26",
        downPayment: 1000,
        isDownPaymentPaid: true,
        isInstalled: false,
      },
    ];

    const result = await caller.orders.saveAll({
      orders: testOrders,
      passcode: "2026326",
    });

    expect(result.success).toBe(true);
  });

  it("should reject save with incorrect passcode", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const testOrders = [
      {
        id: "test-order-2",
        customerName: "فاطمة علي",
        location: "جدة",
        doorsCount: 3,
        orderDate: "2026-05-19",
        installationDate: "2026-05-26",
        downPayment: 500,
        isDownPaymentPaid: false,
        isInstalled: false,
      },
    ];

    try {
      await caller.orders.saveAll({
        orders: testOrders,
        passcode: "wrong-passcode",
      });
      expect.fail("Should have thrown an error");
    } catch (error: any) {
      expect(error.message).toContain("Invalid passcode");
    }
  });
});
