<script lang="ts"
        setup
>
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
