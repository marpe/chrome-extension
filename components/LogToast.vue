<script lang="ts" setup>
import { computed, ref } from "vue";
import { useLogging } from "@/utils/logging";

const { logs, logInfo, logError } = useLogging();
const lastLog = computed(() => {
	return logs.ref[logs.ref.length - 1];
});

const logOpen = ref(false);
</script>


<template>
  <template v-if="logOpen">
    <div class="log-toast">
      <div class="log-toast-header">
        <span>Logs</span>
        <button @click="logOpen = false">Close</button>
      </div>
      <div class="log-toast-body">
        <div v-for="log in logs.ref" class="log-toast-item">
          <div class="log-toast-item-header">
            <span>{{ log.severity }}</span>
            <span>{{ log.timestamp }}</span>
          </div>
          <div class="log-toast-item-body">
            <pre>{{ log.message }}</pre>
          </div>
        </div>
      </div>
    </div>
  </template>
</template>