
<script setup
        lang="ts">
import { useAppStore } from "@/stores/app.store";
import type { LogEntry } from "@/utils/state";
const store = useAppStore();
const logging = useLogging();

const toggleShowDebug = (index: number) => {
	open.value = {
		...open.value,
		[index]: !open.value[index],
	};
};

const open = ref<Record<number, boolean>>({});

watch(
	() => store.loaded,
	(newValue) => {
		console.log("store.loaded", toRaw(logging.logs.ref));
	},
);

const clearLogs = () => {
	logging.clearLogs();
};

const sortedLogs = useSorted<LogEntry>(
	() => logging.logs.ref,
	(a, b) => b.timestamp - a.timestamp,
);
</script>

<template>
 <main>
   <template v-if="store.loaded">
     <div class="flex flex-row items-center justify-between">
        <div>
          <button @click="clearLogs" class="btn-outlined" :disabled="logging.logs.ref.length === 0">
            Clear Logs
          </button>
        </div>
       
       <div>
         {{logging.logs.ref.length}} log(s)
       </div>
     </div>
     <div class="logs">
       <template v-for="(log, index) in sortedLogs" :key="index">
         <div class="flex flex-col log" :data-severity="log.severity">
           <div class="flex flex-row gap-4">
             <span class="timestamp">
               {{ useDateFormat(log.timestamp, "HH:mm:ss") }}
             </span>
             <span class="severity" :data-severity="log.severity">
               {{ log.severity }}
             </span>
             <span class="message">
               {{ log.message }}
             </span>
           </div>
           <div
               v-if="log.data !== undefined && log.data !== null"
               class="data"
               :data-open="!!open[index]"
               @click="toggleShowDebug(index)"
           >
             <Debug>
               {{ JSON.stringify(log.data, null, 2) }}
             </Debug>
           </div>
         </div>
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