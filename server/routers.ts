import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies.js";
import { systemRouter } from "./_core/systemRouter.js";
import { publicProcedure, router } from "./_core/trpc.js";
import { getAllDoors, addDoor, updateDoor, deleteDoor } from "./db.js";
import { uploadImageToStorage } from "./upload.js";
import { z } from "zod";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req as any);
      (ctx.res as any).clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  doors: router({
    list: publicProcedure.query(async () => {
      return await getAllDoors();
    }),
    uploadImage: publicProcedure
      .input(z.object({
        imageData: z.string(),
      }))
      .mutation(async ({ input }) => {
        const url = await uploadImageToStorage(input.imageData);
        return { url };
      }),
    add: publicProcedure
      .input(z.object({
        code: z.string().min(1),
        imageUrl: z.string().min(1),
        passcode: z.string(),
      }))
      .mutation(async ({ input }) => {
        if (input.passcode !== '2026326') {
          throw new Error('Invalid passcode');
        }
        return await addDoor(input.code, input.imageUrl);
      }),
    update: publicProcedure
      .input(z.object({
        id: z.number(),
        code: z.string().min(1),
        imageUrl: z.string().min(1),
        passcode: z.string(),
      }))
      .mutation(async ({ input }) => {
        if (input.passcode !== '2026326') {
          throw new Error('Invalid passcode');
        }
        return await updateDoor(input.id, input.code, input.imageUrl);
      }),
    delete: publicProcedure
      .input(z.object({
        id: z.number(),
        passcode: z.string(),
      }))
      .mutation(async ({ input }) => {
        if (input.passcode !== '2026326') {
          throw new Error('Invalid passcode');
        }
        return await deleteDoor(input.id);
      }),
  }),
});

export type AppRouter = typeof appRouter;
