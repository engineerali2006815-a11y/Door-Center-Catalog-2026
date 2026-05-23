import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies.js";
import { systemRouter } from "./_core/systemRouter.js";
import { publicProcedure, router } from "./_core/trpc.js";
import { getAllDoors, addDoor, updateDoor, deleteDoor, getAllOrders, replaceAllOrders } from "./db.js";
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
  orders: router({
    list: publicProcedure.query(async () => {
      const orders = await getAllOrders();
      return orders.map(order => {
        let location = order.location;
        let latitude = null;
        let longitude = null;
        let phoneNumber = null;

        if (location.startsWith('{') && location.endsWith('}')) {
          try {
            const parsed = JSON.parse(location);
            location = parsed.address || '';
            latitude = parsed.lat || null;
            longitude = parsed.lng || null;
            phoneNumber = parsed.phone || null;
          } catch (e) {
            // Ignore parse errors, treat as plain string
          }
        }

        return {
          ...order,
          location,
          latitude,
          longitude,
          phoneNumber
        };
      });
    }),
    saveAll: publicProcedure
      .input(z.object({
        orders: z.array(z.object({
          id: z.string(),
          customerName: z.string(),
          location: z.string(),
          doorsCount: z.number().nullable(),
          orderDate: z.string(),
          installationDate: z.string(),
          downPayment: z.number().nullable(),
          isDownPaymentPaid: z.boolean(),
          isInstalled: z.boolean(),
          latitude: z.number().nullable().optional(),
          longitude: z.number().nullable().optional(),
          phoneNumber: z.string().nullable().optional(),
        })),
        passcode: z.string(),
      }))
      .mutation(async ({ input }) => {
        if (input.passcode !== '2026326') {
          throw new Error('Invalid passcode');
        }
        
        const ordersToSave = input.orders.map(o => {
          let serializedLocation = o.location;
          if (o.latitude != null || o.longitude != null || o.phoneNumber != null) {
            serializedLocation = JSON.stringify({
              address: o.location,
              lat: o.latitude,
              lng: o.longitude,
              phone: o.phoneNumber
            });
          }

          return {
            id: o.id,
            customerName: o.customerName,
            location: serializedLocation,
            doorsCount: o.doorsCount ?? null,
            orderDate: o.orderDate,
            installationDate: o.installationDate,
            downPayment: o.downPayment ?? null,
            isDownPaymentPaid: o.isDownPaymentPaid,
            isInstalled: o.isInstalled,
          };
        });
        
        return await replaceAllOrders(ordersToSave);
      }),
  }),
});

export type AppRouter = typeof appRouter;
