<script lang="ts">
	import { updateTableOpen } from '$lib/store/modal'
	import { Button, Label, Modal, Input, Spinner, Toast, Dropdown, DropdownItem } from 'flowbite-svelte'
	import type { Validation } from 'sveltekit-superforms'
	import { FieldId, createUpdateTableSchema, updateTableSchema } from '@undb/core'
	import { superForm } from 'sveltekit-superforms/client'
	import { trpc } from '$lib/trpc/client'
	import { slide } from 'svelte/transition'
	import { t } from '$lib/i18n'
	import { getTable } from '$lib/store/table'
	import { goto, invalidateAll } from '$app/navigation'

	export let data: Validation<ReturnType<typeof createUpdateTableSchema>>
	let opened: Record<string, boolean> = {}

	const table = getTable()

	const addField = () => {
		const id = FieldId.createId()
		opened = { [id]: true }
	}

	const updateTable = trpc().table.update.mutation({
		async onSuccess(data, variables, context) {
			updateTableOpen.set(false)
		},
	})

	const deleteTable = trpc().table.delete.mutation({
		async onSuccess(data, variables, context) {
			await invalidateAll()
			await goto('/')
		},
	})

	const superFrm = superForm(data, {
		id: 'updateTable',
		SPA: true,
		applyAction: false,
		resetForm: true,
		invalidateAll: true,
		clearOnSubmit: 'errors-and-message',
		dataType: 'json',
		taintedMessage: null,
		validators: createUpdateTableSchema($table),
		async onUpdate(event) {
			reset()
			$updateTable.mutate({ id: $table.id.value, ...event.form.data })
		},
	})

	const { form, errors, reset, constraints, enhance, delayed, submitting } = superFrm

	let confirmDeleteTable = false
</script>

<Modal placement="top-center" class="static w-full rounded-sm" size="lg" bind:open={$updateTableOpen}>
	<svelte:fragment slot="header">
		<div class="flex justify-between w-full mr-6">
			<p class="text-lg dark:text-white">{$t('Update Table')}</p>
			<button>
				<i class="ti ti-dots" />
			</button>
			<Dropdown>
				<DropdownItem class="inline-flex items-center gap-2 text-red-400" on:click={() => (confirmDeleteTable = true)}>
					<i class="ti ti-trash" />
					<span class="text-xs">{$t('Delete Table')}</span>
				</DropdownItem>
			</Dropdown>
		</div>
	</svelte:fragment>
	<form id="updateTable" class="flex flex-col justify-between flex-1 gap-2" method="POST" use:enhance>
		<div>
			<div>
				<Label class="space-y-2">
					<span>
						<span>{$t('Name', { ns: 'common' })}</span>
						<span class="text-red-500">*</span>
					</span>
					<Input
						data-auto-focus
						id="name"
						name="name"
						type="text"
						label="name"
						bind:value={$form.name}
						data-invalid={$errors.name}
						required
						{...$constraints.name}
					/>
				</Label>

				<!-- {#if $form.schema?.length}
					<Accordion class="my-4">
						{#each $form.schema as field, i (field.id)}
							<CreateTableFieldAccordionItem bind:open={opened[field.id ?? '']} {superFrm} {i} {field} />
						{/each}
					</Accordion>
				{/if} -->
			</div>

			<!-- <Button color="light" outline class="w-full my-3" on:click={addField}>
				<i class="ti ti-plus text-sm mr-4" />
				{$t('Create New Field')}</Button
			> -->
		</div>
	</form>

	<svelte:fragment slot="footer">
		<div class="w-full flex justify-end gap-2">
			<Button color="alternative" on:click={() => updateTableOpen.set(false)}>{$t('Cancel', { ns: 'common' })}</Button>
			<Button class="gap-4" type="submit" form="updateTable" disabled={$submitting}>
				{#if $delayed}
					<Spinner size="5" />
				{/if}
				{$t('Update Table')}</Button
			>
		</div>
	</svelte:fragment>
</Modal>

{#if $updateTable.error}
	<Toast transition={slide} position="bottom-right" class="z-[99999] !bg-red-500 border-0 text-white font-semibold">
		<span class="inline-flex items-center gap-3">
			<i class="ti ti-exclamation-circle text-lg" />
			{$updateTable.error.message}
		</span>
	</Toast>
{/if}

<Modal bind:open={confirmDeleteTable} size="xs">
	<div class="text-center">
		<svg
			aria-hidden="true"
			class="mx-auto mb-4 w-14 h-14 text-gray-400 dark:text-gray-200"
			fill="none"
			stroke="currentColor"
			viewBox="0 0 24 24"
			xmlns="http://www.w3.org/2000/svg"
			><path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
			/></svg
		>
		<h3 class="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
			{$t('Confirm Delete Table')}
		</h3>
		<Button
			color="red"
			class="mr-2 gap-2"
			on:click={() => {
				$deleteTable.mutate({ id: $table.id.value })
			}}
		>
			<i class="ti ti-circle-check text-lg" />
			{$t('Confirm Yes', { ns: 'common' })}</Button
		>
		<Button color="alternative">{$t('Confirm No', { ns: 'common' })}</Button>
	</div>
</Modal>