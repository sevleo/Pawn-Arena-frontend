<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <div class="about flex flex-col">
    <RouterLink to="/about">About</RouterLink>
    <RouterLink to="/game">Play</RouterLink>
    <p>This is Home view</p>
  </div>
</template>

<style scoped>
canvas {
  background-color: rgba(245, 222, 179, 0.486);
  border: solid red 2px;
}
</style>
