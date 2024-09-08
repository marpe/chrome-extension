
<script setup lang="ts">
const props = defineProps({
	log: {
		type: Object as PropType<LogEntry>,
		required: true,
	},
	index: {
		type: Number,
		required: true,
	},
	open: {
		type: Boolean,
		required: true,
	},
});

const emit = defineEmits<{
	toggle: [index: number];
}>();
</script>

<template>
  <div class="flex flex-col log" :data-severity="log.severity">
    <div class="flex flex-row gap-4">
      <span class="timestamp">
        {{ useDateFormat(props.log.timestamp, "HH:mm:ss") }}
      </span>
      <span class="severity" :data-severity="log.severity">
        {{ props.log.severity }}
      </span>
      <span class="message">
        {{ props.log.message }}
      </span>
    </div>
    <div
        v-if="props.log.data !== undefined && log.data !== null"
        class="data"
        :data-open="props.open"
        @click="emit('toggle', index)"
    >
      <Debug>
        {{ JSON.stringify(log.data, null, 2) }}
      </Debug>
    </div>
  </div>
</template>

<style>

.log {
  padding: 0.25rem;
  border-bottom: 1px solid var(--surface-5);
}

.log[data-severity="error"] {
  background-color: rgb(from var(--red-12) r g b / 0.25);
}
.log[data-severity="warn"] {
  background-color: rgb(from var(--yellow-12) r g b / 0.25);
}
.log[data-severity="info"] {
  background-color: rgb(from var(--blue-12) r g b / 0.25);
}
.log[data-severity="debug"] {
  background-color: rgb(from var(--green-12) r g b / 0.25);
}

.data {
  &[data-open="false"] {
    overflow: clip;
    max-height: 1rem;
  }
  cursor: pointer;
  min-height: 1ch;
  overflow: hidden;
  border: 1px solid var(--surface-6);
  padding: 0.5rem;
  background-color: var(--surface-2);
  margin-top: 0.5rem;
  color: var(--text-3);
}

.timestamp {
  color: var(--gray-6);
}
.severity[data-severity="error"] {
  color: var(--red-6);
}
.severity[data-severity="warn"] {
  color: var(--yellow-6);
}
.severity[data-severity="info"] {
  color: var(--blue-6);
}
.severity[data-severity="debug"] {
  color: var(--green-6);
}
</style>