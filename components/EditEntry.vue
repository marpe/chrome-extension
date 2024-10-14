


<script lang="ts" setup>
const model = defineModel({
	type: Object as PropType<CustomEntry>,
	required: true,
});

const emit = defineEmits<{
	save: [];
}>();

const formattedModifiedDateTime = useDateFormat(
	model.value.modified,
	"YYYY-MM-DD HH:mm",
);
const formattedCreatedDateTime = useDateFormat(
	model.value.created,
	"YYYY-MM-DD HH:mm",
);

const keys = useMagicKeys({
	passive: false,
	onEventFired: (event) => {
		if (event.key === "s" && event.ctrlKey) {
			emit("save");
			event.preventDefault();
		}
	},
});

const styleVersion = ref(1);
const scriptVersion = ref(1);
</script>

<template>
  <div class="flex flex-col gap-4">
    <div>
      <div class="text-xs flex justify-between">
        <div>
          <span class="text-gray-400">Version: </span>
          {{ model.revision }}
        </div>
        <div>
          <span class="text-gray-400">Modified: </span>
          <span :title="formattedModifiedDateTime">
            {{ useTimeAgo(model.modified) }}
          </span>
        </div>
        <div>
          <span class="text-gray-400">Created: </span>
          {{ useDateFormat(model.created, "YYYY-MM-DD HH:mm") }}
        </div>
      </div>
    </div>

      <div class="flex flex-col gap-4">
        <div class="flex flex-col gap-2">
          <label for="description">Name</label>
          <input v-model="model.description"
                 id="description"
                 style="width: 100%" />
        </div>

        <div class="flex flex-col gap-2">
          <label for="site">Site</label>
          <input v-model="model.site"
                 id="site"
                 style="width: 100%" />
        </div>

        <div class="flex flex-col gap-2">
          <div class="flex flex-row items-center gap-4">
            <input v-model="model.enabled"
                   id="enabled"
                   :checked="model.enabled"
                   type="checkbox" />
            <label for="enabled">Enabled</label>
          </div>
        </div>

        <div class="flex flex-col gap-2">
          <label for="runAt">Run at</label>
          <select v-model="model.runAt"
                  id="runAt"
                  class="text-xs"
                  style="width: 100%">
            <option value="document_start">document_start</option>
            <option value="document_end">document_end</option>
            <option value="document_idle">document_idle</option>
          </select>
        </div>
      </div>

    <div :style="{ flex: '0 1 0' }">
      <MonacoEditor v-model="model.style"
                    v-model:version="styleVersion"
                    :initial="model.style"
                    language="css" />
    </div>

    <div :style="{ flex: '0 1 0' }">
      <MonacoEditor v-model="model.script"
                    v-model:version="scriptVersion"
                    :initial="model.script"
                    language="javascript" />
    </div>

  </div>
</template>