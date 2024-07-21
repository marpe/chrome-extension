<script setup
        lang="ts"
>

useHead({
  title: 'My Page',
  meta: [
    {
      charset: 'utf-8',
    },
    {
      name: "viewport",
      content: "width=device-width, initial-scale=1.0",
    },
    {
      name: 'description',
      content: 'My page description',
    },
  ],
})
</script>

<template>
  <RouterView />
</template>

<style>
@import "../assets/base.scss";
</style>
