import { UpdateVisualizationCommand, updateVisualizationCommandInput } from '@undb/cqrs'
import type { ICommandBus } from '@undb/domain'
import { z } from 'zod'
import type { publicProcedure } from '../trpc.js'
import { router } from '../trpc.js'

export const createVisualizationRouter = (procedure: typeof publicProcedure) => (commandBus: ICommandBus) =>
  router({
    update: procedure
      .input(updateVisualizationCommandInput)
      .output(z.void())
      .mutation(({ input }) => {
        const cmd = new UpdateVisualizationCommand(input)
        return commandBus.execute<void>(cmd)
      }),
  })
