import type { IRecordRepository, RecordExportorService } from '@undb/core'
import { WithRecordTableId, type ITableRepository } from '@undb/core'
import type { ICommandHandler } from '@undb/domain'
import type { ExportGridCommand } from './export-grid.command.js'

export class ExportGridCommandHandler implements ICommandHandler<ExportGridCommand, string | Buffer> {
  constructor(
    protected readonly tableRepo: ITableRepository,
    protected readonly recordRepo: IRecordRepository,
    protected readonly service: RecordExportorService,
  ) {}

  async execute(command: ExportGridCommand): Promise<string | Buffer> {
    const table = (await this.tableRepo.findOneById(command.tableId)).unwrap()
    const filter = table.getSpec(command.viewId)

    const spec = WithRecordTableId.fromString(command.tableId)
      .map((s) => (filter.isNone() ? s : s.and(filter.unwrap())))
      .unwrap()

    const records = await this.recordRepo.find(table.id.value, spec, table.schema.toIdMap())

    const exportor = this.service.getExportor(command.type)

    return exportor.export(table, command.viewId, records)
  }
}
