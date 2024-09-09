<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <div class="about flex flex-col">
    <div class="flex">
      <div class="max-w-[400px]">
        <!-- <p class="text-[#00bd7e]">Welcome to</p> -->
        <p className="text-[50px] mb-5">Pawn Arena</p>
        <ul class="custom-bullets">
          <li>You control a pawn that can shoot bullets</li>
          <li>Your mission is to stay alive while destroying as many other pawns as you can</li>
          <li>This game can only be played with other players</li>
          <li>There is only one room for all players</li>
          <li>ASDW for moving, Space for shooting, mouse control for direction</li>
        </ul>
      </div>
    </div>
    <div class="mt-[10px] flex flex-col">
      <RouterLink to="/game" class="text-[20px] hover:bg-transparent hover:text-red-600 p-0">
        Play the game
      </RouterLink>
      <RouterLink to="/about" class="text-[20px] hover:bg-transparent hover:text-red-600 p-0"
        >Read about project</RouterLink
      >
    </div>
  </div>
</template>

<style scoped>
canvas {
  background-color: rgba(245, 222, 179, 0.486);
  border: solid red 2px;
}
.custom-bullets li {
  position: relative;
  margin-bottom: 10px; /* Add space between list items */
  padding-left: 20px; /* Space between bullet and text */
}

.custom-bullets li::before {
  content: ''; /* Creates the custom bullet */
  position: absolute;
  left: 0;
  top: 10px;
  /* transform: translateY(-50%); */
  width: 4px; /* Customize bullet size */
  height: 4px; /* Customize bullet size */
  background-color: rgba(235, 235, 235, 0.85); /* Customize bullet color */
  border-radius: 0%; /* Makes the bullet a circle */
}
</style>
