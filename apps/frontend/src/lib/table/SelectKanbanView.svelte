<script lang="ts">
	import {
		currentFieldId,
		currentOption,
		currentRecordId,
		currentRecords,
		getRecords,
		getTable,
		getView,
		recordHash,
	} from '$lib/store/table'
	import { flip } from 'svelte/animate'
	import Option from '$lib/option/Option.svelte'
	import { TRIGGERS, dndzone } from 'svelte-dnd-action'
	import { groupBy } from 'lodash-es'
	import { Record, RecordFactory, type SelectField, type SelectFieldValue } from '@undb/core'
	import { trpc } from '$lib/trpc/client'
	import KanbanCard from '$lib/kanban/KanbanCard.svelte'
	import { Badge, Button, Dropdown, DropdownItem, Toast } from 'flowbite-svelte'
	import { createOptionOpen, createRecordInitial, createRecordOpen, updateOptionOpen } from '$lib/store/modal'
	import { invalidate } from '$app/navigation'
	import { slide } from 'svelte/transition'
	import { t } from '$lib/i18n'

	export let field: SelectField
	const flipDurationMs = 200

	const table = getTable()
	const view = getView()

	$: data = trpc().record.list.query({ tableId: $table.id.value, viewId: $view.id.value }, { queryHash: $recordHash })

	$: records = RecordFactory.fromQueryRecords($data.data?.records ?? [], $table.schema.toIdMap())
	$: $currentRecords = records

	$: options = field?.options?.options ?? []

	const UNCATEGORIZED = 'Uncategorized'
	$: groupedRecords = groupBy(records, (record: Record) => {
		const value = (field ? record.values.value.get(field.id.value) : undefined) as SelectFieldValue | undefined

		if (!value?.id) return UNCATEGORIZED
		return value.id
	})

	$: items = [
		{
			id: UNCATEGORIZED,
			name: $t(UNCATEGORIZED),
			option: null,
			records: groupedRecords[UNCATEGORIZED]?.map((record: Record) => ({ id: record.id.value, record })) ?? [],
		},
		...options.map((option) => ({
			id: option.key.value,
			name: option.name.value,
			option,
			records: groupedRecords[option.key.value]?.map((record: Record) => ({ id: record.id.value, record })) ?? [],
		})),
	]

	function handleDndConsiderColumns(e: any) {
		items = e.detail.items
	}

	const reorderOptions = trpc().table.field.select.reorderOptions.mutation({
		async onSuccess(data, variables, context) {
			await invalidate(`table:${$table.id.value}`)
		},
	})

	const deleteOption = trpc().table.field.select.deleteOption.mutation({
		async onSuccess(data, variables, context) {
			await invalidate(`table:${$table.id.value}`)
		},
	})

	async function handleDndFinalizeColumns(e: any) {
		items = e.detail.items
		if (e.detail.info.id === UNCATEGORIZED) return

		const from = e.detail.info.id
		const toIndex = items.findIndex((i) => i.id === from) - 1
		const to = options[toIndex]?.key.value
		if (to && to !== from && field) {
			$reorderOptions.mutate({
				tableId: $table.id.value,
				fieldId: field?.id.value,
				from,
				to,
			})
		}
	}

	function handleDndConsiderCards(cid: string, e: any) {
		const colIdx = items.findIndex((c) => c.id === cid)
		if (items[colIdx]) {
			items[colIdx].records = e.detail.items
			items = [...items]
		}
	}

	const updateRecord = trpc().record.update.mutation({
		async onSuccess(data, variables, context) {
			await $data.refetch()
		},
	})
	async function handleDndFinalizeCards(cid: string, e: any) {
		const colIdx = items.findIndex((c) => c.id === cid)
		if (items[colIdx]) {
			items[colIdx].records = e.detail.items
			items = [...items]
		}

		if (field && e.detail.info.trigger === TRIGGERS.DROPPED_INTO_ZONE) {
			const optionId = e.target.dataset.containerId === UNCATEGORIZED ? null : e.target.dataset.containerId
			if (cid === UNCATEGORIZED && field.required) return
			$updateRecord.mutate({
				tableId: $table.id.value,
				id: e.detail.info.id,
				values: { [field.id.value]: optionId },
			})
		}
	}
</script>

<div
	class="flex gap-5 h-full w-full px-10 py-5 overflow-scroll"
	use:dndzone={{ items, flipDurationMs, type: 'columns', dropTargetStyle: {} }}
	on:consider={handleDndConsiderColumns}
	on:finalize={handleDndFinalizeColumns}
>
	{#each items as item (item.id)}
		<div animate:flip={{ duration: flipDurationMs }}>
			<div class="w-[350px] flex flex-col h-full">
				<div class="mb-3 flex-0">
					<div class="min-h-[40px]">
						{#if item.option}
							<div class="flex items-center justify-between pr-2">
								<Option option={item.option} />
								<i class="ti ti-dots text-gray-400" />
								<Dropdown>
									<DropdownItem
										class="text-gray-600 text-xs space-y-2"
										on:click={() => {
											$currentFieldId = field?.id.value
											$currentOption = item.option
											$updateOptionOpen = true
										}}
									>
										<i class="ti ti-pencil" />
										<span>
											{$t('Update Option')}
										</span>
									</DropdownItem>
									<DropdownItem
										class="text-red-400 text-xs space-y-2"
										on:click={() => {
											if (item.option && field) {
												$deleteOption.mutate({
													tableId: $table.id.value,
													fieldId: field.id.value,
													id: item.option.key.value,
												})
											}
										}}
									>
										<i class="ti ti-trash" />
										<span>
											{$t('Delete Option')}
										</span>
									</DropdownItem>
								</Dropdown>
							</div>
						{:else}
							<Badge color="dark">{item.name}</Badge>
						{/if}
					</div>

					<Button
						color="alternative"
						class="w-full rounded-md transition h-8"
						size="xs"
						on:click={() => {
							if (field && item.id !== UNCATEGORIZED) {
								$createRecordInitial = {
									[field.id.value]: item.id,
								}
							}
							$createRecordOpen = true
						}}
					>
						<i class="ti ti-row-insert-top text-sm" />
					</Button>
				</div>

				<div
					class="flex flex-col gap-2 flex-1 overflow-y-auto"
					data-container-id={item.id}
					use:dndzone={{ items: item.records, flipDurationMs, dropTargetStyle: {} }}
					on:consider={(e) => handleDndConsiderCards(item.id, e)}
					on:finalize={(e) => handleDndFinalizeCards(item.id, e)}
				>
					{#each item.records as record (record.id)}
						<div animate:flip={{ duration: flipDurationMs }}>
							<button
								data-record-id={record.id}
								class="!block w-full"
								on:click|preventDefault|stopPropagation={() => {
									$currentRecordId = record.id
								}}
							>
								<KanbanCard record={record.record} />
							</button>
						</div>
					{/each}
				</div>
			</div>
		</div>
	{/each}

	<div class="w-[350px] shrink-0">
		<Button
			on:click={() => {
				currentFieldId.set(field?.id.value)
				createOptionOpen.set(true)
			}}
			size="xs"
			color="light"
			outline
			class="w-full rounded-sm whitespace-nowrap inline-flex gap-2"
		>
			<i class="ti ti-plus" />
			{$t('Create New Option')}</Button
		>
	</div>
</div>

{#if $reorderOptions.error}
	<Toast transition={slide} position="bottom-right" class="z-[99999] !bg-red-500 border-0 text-white font-semibold">
		<span class="inline-flex items-center gap-3">
			<i class="ti ti-exclamation-circle text-lg" />
			{$reorderOptions.error.message}
		</span>
	</Toast>
{/if}

{#if $updateRecord.error}
	<Toast transition={slide} position="bottom-right" class="z-[99999] !bg-red-500 border-0 text-white font-semibold">
		<span class="inline-flex items-center gap-3">
			<i class="ti ti-exclamation-circle text-lg" />
			{$updateRecord.error.message}
		</span>
	</Toast>
{/if}