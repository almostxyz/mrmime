import { initTRPC, inferAsyncReturnType } from "@trpc/server";
import { z } from "zod";
import * as trpcExpress from '@trpc/server/adapters/express';
import express from 'express'

// created for each request
const createContext = ({
    req,
    res,
  }: trpcExpress.CreateExpressContextOptions) => ({}); // no context
  type Context = inferAsyncReturnType<typeof createContext>;

const t = initTRPC()()

const appRouter = t.router({
    asana: t.procedure
        .input(z.string)
        .mutation((req) => {

        }),

    gitlab: t.procedure
        .input(z.string)
        .mutation((req) => {

        })
})

// probably useless
export type AppRouter = typeof appRouter

const app = express()

app.use(
    '/trpc',
    trpcExpress.createExpressMiddleware({
        router: appRouter,
        createContext
    })
)

app.listen(4000)