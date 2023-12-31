import type { IQueryHandler } from '@nestjs/cqrs'
import { QueryHandler } from '@nestjs/cqrs'
import { type IRecordQueryModel, type ITableQueryModel } from '@undb/core'
import type { IGetShareViewRecordsOutput } from '@undb/cqrs'
import { GetShareViewRecordsQuery, GetShareViewRecordsQueryHandler } from '@undb/cqrs'
import { InjectRecordQueryModel } from '../../core/table/adapters/sqlite/record-sqlite.query-model.js'
import { InjectTableQueryModel } from '../../core/table/adapters/sqlite/table-sqlite.query-model.js'
import { NestShareGuardService } from '../services/share-guard.service.js'

@QueryHandler(GetShareViewRecordsQuery)
export class NestGetShareViewRecordsQueryHandler
  extends GetShareViewRecordsQueryHandler
  implements IQueryHandler<GetShareViewRecordsQuery, IGetShareViewRecordsOutput>
{
  constructor(
    guard: NestShareGuardService,
    @InjectTableQueryModel()
    protected readonly tableRepo: ITableQueryModel,
    @InjectRecordQueryModel()
    protected readonly rm: IRecordQueryModel,
  ) {
    super(guard, tableRepo, rm)
  }
}
