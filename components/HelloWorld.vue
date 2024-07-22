<script lang="ts"
        setup
>
import { useAppStore } from "@/stores/app.store";

defineProps({
  msg: String,
});


const store = useAppStore();
</script>

<template>
  <h1>{{ msg }}</h1>

  <div class="card">
    <button
      type="button"
      class="btn"
      @click="store.increment"
    >
      count is {{ store.count }}
    </button>
    <p>
      Edit
      <code>components/HelloWorld.vue</code>
      to test HMR
    </p>
  </div>


  <div class="card">
    <button @click="save">
      😊
    </button>
  </div>

  <p>
    Install
    <a
      href="https://github.com/vuejs/language-tools"
      target="_blank"
    >Volar
    </a>
    in your IDE for a better DX
  </p>
  <p class="read-the-docs">
    Click on the WXT and Vue logos to learn more
  </p>
</template>

<style scoped>
.read-the-docs {
  color: #888;
}
</style>
