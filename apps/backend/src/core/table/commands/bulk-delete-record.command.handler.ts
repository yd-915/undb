import type { ICommandHandler } from '@nestjs/cqrs'
import { CommandHandler } from '@nestjs/cqrs'
import { type IRecordRepository, type ITableRepository } from '@undb/core'
import { BulkDeleteRecordsCommand, BulkDeleteRecordsCommandHandler as DomainHandler } from '@undb/cqrs'
import { InjectRecordRepository } from '../adapters/sqlite/record-sqlite.repository.js'
import { InjectTableRepository } from '../adapters/sqlite/table-sqlite.repository.js'

@CommandHandler(BulkDeleteRecordsCommand)
export class BulkDeleteRecordsCommandHandler
  extends DomainHandler
  implements ICommandHandler<BulkDeleteRecordsCommand>
{
  constructor(
    @InjectTableRepository()
    protected readonly tableRepo: ITableRepository,

    @InjectRecordRepository()
    protected readonly recordRepo: IRecordRepository,
  ) {
    super(tableRepo, recordRepo)
  }
}
