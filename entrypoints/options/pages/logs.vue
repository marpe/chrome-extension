
<script setup
        lang="ts">
import { useAppStore } from "@/stores/app.store";
import type { LogEntry } from "@/utils/state";
import { ref } from "vue";
import { useSorted } from "@vueuse/core";
const store = useAppStore();

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
	() => store.logs.ref,
	(a, b) => b.timestamp - a.timestamp,
);
</script>

<template>
 <main class="p-4">
   <template v-if="store.loaded">
     <div class="flex flex-row items-center justify-between">
        <div>
          <button @click="clearLogs" class="btn-outlined" :disabled="store.logs.ref.length === 0">
            Clear Logs
          </button>
        </div>
       
       <div>
         {{store.logs.ref.length}} log(s)
       </div>
     </div>
     <div class="logs">
       <template v-for="(log, index) in sortedLogs" :key="index">
         <LogLine :log="log" :index="index" :open="!!open[index]" @toggle="toggleShowDebug" />
       </template>
     </div>
   </template>
 </main>
</template>

<style>
.logs {
  overflow: auto;
  font-family: var(--font-mono);
  font-size: 0.75rem;
}
</style>