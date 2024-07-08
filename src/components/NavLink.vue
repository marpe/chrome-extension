<script setup
        lang="ts">
import AppLink from "@/components/AppLink.vue";
</script>

<template>
  <AppLink
    v-bind="$attrs"
    class="`
inline-flex items-center px-1 pt-1 border-b-2 
border-transparent text-sm font-medium leading-5 text-gray-500 
hover:text-blue-300 hover:border-gray-300 focus:outline-none 
focus:text-blue-300 focus:border-gray-300 transition duration-150 ease-in-out
`"
    active-class="border-indigo-500 text-green-200 focus:border-indigo-700"
    inactive-class="text-gray-400 hover:text-blue-300 hover:border-gray-300 focus:text-blue-300 focus:border-gray-300"
  >
    <slot />
  </AppLink>
</template>
