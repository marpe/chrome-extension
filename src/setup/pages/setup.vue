<script setup
        lang="ts"
>
import type { ISetup } from '@/setup'

const setup = inject<ISetup>('setupType')


useHead({
  title: __DISPLAY_NAME__,
  meta: [
    {
      name: 'description',
      content: setup?.setupType === 'install' ? 'Thank you for installing!' : 'Thank you for updating!',
    },
  ],
});


</script>

<template>
  <div class="p-10 flex flex-col flex-1 justify-center">
    <div class="flex flex-col items-center">
      <RouterView />
    </div>
  </div>
</template>

<style lang="scss"></style>
