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
<style>
a[href] {
  &.active {
    color: var(--brand-0);
    text-decoration: underline;
    text-decoration-thickness: 2px;
    text-decoration-color: var(--brand-5);
  }
}
</style>
