<template>
  <AppLink
    v-bind="$attrs"
    class=""
    active-class="active"
    inactive-class="inactive"
  >
    <slot />
  </AppLink>
</template>
