<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <div class="home flex flex-col">
    <RouterLink to="/">Home</RouterLink>
    <RouterLink to="/about">About</RouterLink>
    <RouterLink to="/game">Play</RouterLink>
  </div>
</template>
