<script lang="ts">
	import { format, startOfDay } from 'date-fns'
	import { Input } from 'flowbite-svelte'
	import { isString } from 'lodash-es'

	function dateIsValid(date: string) {
		return !Number.isNaN(new Date(date).getTime())
	}

	export let value: string | undefined = undefined

	let dateValue = isString(value) && dateIsValid(value) ? format(new Date(value), 'yyyy-MM-dd') : ''
	$: value = dateValue ? startOfDay(new Date(dateValue)).toISOString() : ''
</script>

<Input type="date" bind:value={dateValue} {...$$restProps} />
