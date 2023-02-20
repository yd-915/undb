import type { IFieldType } from '@egodb/core'
import { useGetTableQuery } from '@egodb/store'
import type { MultiSelectProps, SelectItem as SelectItemType } from '@egodb/ui'
import { ActionIcon, Group, Text } from '@egodb/ui'
import { MultiSelect } from '@egodb/ui'
import { forwardRef } from 'react'
import { FieldIcon } from './field-Icon'
import { FieldInputLabel } from './field-input-label'

interface IProps extends Omit<MultiSelectProps, 'data'> {
  tableId?: string
}

interface ItemProps extends React.ComponentPropsWithoutRef<'div'> {
  value: string
  label: string
  type: IFieldType
}
const SelectItem = forwardRef<HTMLDivElement, ItemProps>(({ label, type, ...others }: ItemProps, ref) => (
  <Group ref={ref} p="xs" {...others}>
    <ActionIcon size="sm">
      <FieldIcon type={type} />
    </ActionIcon>
    <Text>{label}</Text>
  </Group>
))

export const FieldsPicker: React.FC<IProps> = ({ tableId, ...props }) => {
  const { data: table } = useGetTableQuery(
    {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      id: tableId!,
    },
    {
      skip: !tableId,
    },
  )

  const data =
    table?.schema?.map((f, index) => ({
      value: f.id,
      label: f.name || `Field ` + (index + 1),
      type: f.type,
    })) ?? ([] as SelectItemType[])

  return (
    <MultiSelect
      placeholder="select display fields"
      variant="filled"
      label={<FieldInputLabel>Display Fields</FieldInputLabel>}
      {...props}
      data={data}
      itemComponent={SelectItem}
    />
  )
}
