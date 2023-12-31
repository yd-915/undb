import { createMutateRecordValuesSchema, type IRecordRepository, type ITableRepository } from '@undb/core'
import type { ICommandHandler } from '@undb/domain'
import { withShare, type IShareGuardService } from '@undb/integrations'
import type { ICreateTableOutput } from '../create-table/index.js'
import type { CreateShareRecordCommand } from './create-share-record.comand.js'

export class CreateShareRecordCommandHandler implements ICommandHandler<CreateShareRecordCommand, ICreateTableOutput> {
  constructor(
    protected readonly guard: IShareGuardService,
    protected readonly tableRepo: ITableRepository,
    protected readonly recordRepo: IRecordRepository,
  ) {}

  async execute(command: CreateShareRecordCommand): Promise<ICreateTableOutput> {
    await this.guard.verify(withShare(command.target.type, command.target.id))

    const table = (await this.tableRepo.findOneById(command.tableId)).unwrap()
    const form = command.target.type === 'form' ? table.forms.getById(command.target.id).unwrap() : undefined
    const schema = createMutateRecordValuesSchema(table.schema.fields, undefined, form?.fields)

    const record = table.createRecord(command.id, schema.parse(command.values))
    await this.recordRepo.insert(table, record, table.schema.toIdMap())

    return { id: record.id.value }
  }
}
