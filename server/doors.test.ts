import { describe, expect, it, beforeEach, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createContext(): TrpcContext {
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

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("doors router", () => {
  let caller: ReturnType<typeof appRouter.createCaller>;

  beforeEach(() => {
    const ctx = createContext();
    caller = appRouter.createCaller(ctx);
  });

  it("should list doors", async () => {
    const doors = await caller.doors.list();
    expect(Array.isArray(doors)).toBe(true);
  });

  it("should reject add without correct passcode", async () => {
    try {
      await caller.doors.add({
        code: "TEST-001",
        imageUrl: "https://example.com/image.jpg",
        passcode: "wrong",
      });
      expect.fail("Should have thrown error");
    } catch (error: any) {
      expect(error.message).toBe("Invalid passcode");
    }
  });

  it("should reject update without correct passcode", async () => {
    try {
      await caller.doors.update({
        id: 1,
        code: "TEST-001",
        imageUrl: "https://example.com/image.jpg",
        passcode: "wrong",
      });
      expect.fail("Should have thrown error");
    } catch (error: any) {
      expect(error.message).toBe("Invalid passcode");
    }
  });

  it("should reject delete without correct passcode", async () => {
    try {
      await caller.doors.delete({
        id: 1,
        passcode: "wrong",
      });
      expect.fail("Should have thrown error");
    } catch (error: any) {
      expect(error.message).toBe("Invalid passcode");
    }
  });

  it("should validate passcode is exactly 2026326", async () => {
    // Test with similar but wrong passcode
    try {
      await caller.doors.add({
        code: "TEST-001",
        imageUrl: "https://example.com/image.jpg",
        passcode: "2026327",
      });
      expect.fail("Should have thrown error");
    } catch (error: any) {
      expect(error.message).toBe("Invalid passcode");
    }
  });
});
