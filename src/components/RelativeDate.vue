<script lang="ts" setup>
import { computed, PropType } from "vue";
import { useTimeAgo } from "@vueuse/core";

const { value } = defineProps({
	value: {
		type: Object as PropType<string | number | Date | undefined>,
		required: true,
	},
});

const date = computed(() => {
	if (value) {
		return useTimeAgo(value);
	}
	return "";
});
</script>


<template>
  {{ date }}
</template>