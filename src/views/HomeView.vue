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
          <li>You control a unit that can shoot bullets</li>
          <li>Your mission is to stay alive while destroying as many opponents as you can</li>
          <li>This game can only be played with other players</li>
          <li>There is only one room for all players</li>
          <li>ASDW for moving, Space for shooting, mouse control for direction</li>
        </ul>
      </div>
      <div class="flex justify-center items-center pl-[100px] rounded-[15px]">
        <RouterLink
          to="/game"
          class="w-[140px] h-[60px] flex justify-center items-center bg-slate-800 rounded-[15px] text-[30px] hover:text-red-600"
        >
          Play
        </RouterLink>
      </div>
    </div>
    <div class="mt-[100px]">
      <RouterLink to="/about" class="text-[20px] hover:bg-transparent hover:text-red-600"
        >About the project...</RouterLink
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
  background-color: rgba(235, 235, 235, 0.64); /* Customize bullet color */
  border-radius: 0%; /* Makes the bullet a circle */
}
</style>
