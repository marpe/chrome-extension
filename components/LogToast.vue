<script lang="ts" setup>
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
        <div v-for="log in logs" :key="log.id" class="log-toast-item">
          <div class="log-toast-item-header">
            <span>{{ log.type }}</span>
            <span>{{ log.time }}</span>
          </div>
          <div class="log-toast-item-body">
            <pre>{{ log.message }}</pre>
          </div>
        </div>
      </div>
    </div>
</template>