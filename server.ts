import { initTRPC, inferAsyncReturnType, TRPCError } from "@trpc/server";
import { z } from "zod";
import * as trpcExpress from '@trpc/server/adapters/express';
import express from 'express'

// created for each request
export const createContext = ({
    req,
    res,
  }: trpcExpress.CreateExpressContextOptions) => ({req, res});

type Context = inferAsyncReturnType<typeof createContext>;

const t = initTRPC<{ctx: Context}>()()

const addSecretAsanaHeader = t.middleware(async ({ ctx, next }) => {
    const secret = ctx.req.header('X-Hook-Secret')
    if (secret) {
        ctx.res.setHeader('X-Hook-Secret', secret)
    } else {
        ctx.res.status(204)
    }
    return next({
      ctx
    });
  });

const asanaRouter = t.router({
    handshake: t.procedure
        .use(addSecretAsanaHeader)
        .mutation(() => {
            console.log('handshake hit')
        })
})

const gitlabRouter = t.router({
    test: t.procedure.mutation(() => {})
})

const appRouter = t.router({
    asana: asanaRouter,
    gitlab: gitlabRouter,
})

// probably useless
export type AppRouter = typeof appRouter

const app = express()

app.use(
    '/trpc/asana',
    trpcExpress.createExpressMiddleware({
        router: appRouter.asana,
        createContext
    })
)

app.use(
  '/trpc/gitlab',
  trpcExpress.createExpressMiddleware({
    router: appRouter.gitlab,
    createContext
  })
)

app.listen(4000)

console.log('server started on port 4000...')