<script lang="ts"
        setup
>
import { useRouter } from "vue-router";

const router = useRouter();
</script>

<template>
  <NavLink
    to="/"
    @click="router.go(-1)"
  >
    Back
  </NavLink>
</template>
