<script lang="ts">
	import { getView } from '$lib/store/table'
	import type { IViewDisplayType } from '@undb/core'
	import type { ComponentType } from 'svelte'
	import { Modal } from 'flowbite-svelte'
	import KanbanConfig from './KanbanConfig.svelte'
	import CalendarConfig from '$lib/calendar/CalendarConfig.svelte'
	import { configViewModal } from '$lib/store/modal'
	import TreeConfig from '$lib/tree/TreeConfig.svelte'
	import GanttConfig from '$lib/gantt/GanttConfig.svelte'
	import GalleryConfig from '$lib/gallery/GalleryConfig.svelte'

	const view = getView()

	$: type = $view.displayType

	const components: Partial<Record<IViewDisplayType, ComponentType>> = {
		kanban: KanbanConfig,
		calendar: CalendarConfig,
		gallery: GalleryConfig,
		tree: TreeConfig,
		gantt: GanttConfig,
	}
</script>

<Modal bind:open={$configViewModal.open} placement="top-center" class="w-full">
	<div class="space-y-1">
		<svelte:component this={components[type]} slot="default" />
	</div>
</Modal>
