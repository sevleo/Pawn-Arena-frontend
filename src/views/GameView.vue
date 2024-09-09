<script setup lang="ts">
import { RouterLink } from 'vue-router'

import BlockGame from '@/components/BlockGame.vue'
</script>

<template>
  <div class="about flex flex-col">
    <RouterLink to="/" class="text-[20px] hover:bg-transparent hover:text-red-600 p-0">
      Go to home
    </RouterLink>
    <br />
    <BlockGame />
  </div>
</template>

<style scoped>
canvas {
  background-color: rgba(245, 222, 179, 0.486);
  border: solid red 2px;
}
</style>
