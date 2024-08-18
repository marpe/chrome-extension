<script setup
        lang="ts">

const themeInputs = document.getElementsByName("theme");

themeInputs.forEach(i => {
  i.oninput = e => {
    console.log(e.target);
    // if you want this to not reset on page load
    // you'll want to set a cookie or local storage value
    // which restores the attribute on html

    // eg: html[data-theme="dark"]
    document.firstElementChild!.setAttribute('data-theme', e.target!.value)
  }
});

</script>

<template>
  <form id="theme">
    <label>
      Auto
      <input type="radio" name="theme" value="auto" checked>
    </label>
    <label>
      Light
      <input type="radio" name="theme" value="light">
    </label>
    <label>
      Dark
      <input type="radio" name="theme" value="dark">
    </label>
  </form>
</template>
