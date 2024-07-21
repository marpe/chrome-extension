<script setup lang="ts">
const version = __VERSION__
const displayName = __DISPLAY_NAME__
const gitURL = __GITHUB_URL__
const gitCommit = __GIT_COMMIT__
const gitCommitURL = `${gitURL}/commit/${gitCommit}`

const store = useAppStore()

const name = computed(() => store.name)
const count = computed(() => store.count)
</script>

<template>
  <div class="text-center m-4 flex flex-col gap-y-2">
    <h1 class="text-2xl pb-6">
      Hello!! What!!!!!!!!
    </h1>

    <p>Version: {{ version }}</p>
    <p>Display name: {{ displayName }}</p>

    <p>
      GIT URL:
      <a
        class="text-green-500"
        :href="gitURL"
      >
        {{ gitURL }}
      </a>
    </p>

    <p>
      GIT Commit:
      <a
        :href="gitCommitURL"
        class="text-green-500"
      >
        (#{{ gitCommit }})
      </a>
    </p>

    <p>Name: {{ JSON.stringify(name, null, 2) }}</p>
    <p>Count: {{ JSON.stringify(count, null, 2) }}</p>

    <div class="flex gap-x-2 justify-center">
      <button
        class="btn btn-primary"
        @click="store.increment"
      >
        Increment
      </button>
      <button
        class="btn btn-primary"
        @click="store.decrement"
      >
        Decrement
      </button>
      <button
        class="btn btn-primary"
        @click="store.reset"
      >
        Reset
      </button>
    </div>
  </div>
</template>
