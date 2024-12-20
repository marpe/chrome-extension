
<script lang="ts"
        setup>
import { useAppStore } from "@/stores/app.store";
import type { LogEntry } from "@/utils/state";
import { useSorted } from "@vueuse/core";
import { ref } from "vue";

const store = useAppStore();

await store.loadData();

const toggleShowDebug = (index: number) => {
	open.value = {
		...open.value,
		[index]: !open.value[index],
	};
};

const open = ref<Record<number, boolean>>({});

const clearLogs = () => {
	store.clearLogs();
};

const sortedLogs = useSorted<LogEntry>(
	() => store.logs.state,
	(a, b) => b.timestamp - a.timestamp,
);
</script>

<template>
 <main class="p-4">
   <div class="flex flex-row items-center justify-between">
      <div>
        <button :disabled="store.logs.state.length === 0" class="btn-outlined" @click="clearLogs">
          Clear Logs
        </button>
      </div>

     <div>
       {{store.logs.state.length}} log(s)
     </div>
   </div>
   <div class="logs">
     <template v-for="(log, index) in sortedLogs" :key="index">
       <LogLine :index="index" :log="log" :open="!!open[index]" @toggle="toggleShowDebug" />
     </template>
   </div>
 </main>
</template>

<style>
.logs {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  overflow: auto;
}
</style>