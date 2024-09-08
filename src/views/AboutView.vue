<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <div class="about flex flex-col">
    <RouterLink to="/">Home</RouterLink>
    <RouterLink to="/game">Play</RouterLink>
    <br />
    <div class="max-w-[400px]">
      <ul>
        <li>
          The project came to life spontaneously and unintentionally. My goal was to learn
          websockets, and I thought it would be fun to experiment with websockets in the setting of
          an online game. Little did I know that I would end up going deeper and deeper into the
          rabbit hole of complexities of online game development.
        </li>
        <li>
          I spent weeks not seeing any light at the end and almost on the verge of giving up, but
          still holding onto the belief and coming back to it day after day, eventually proudly
          ending up with what you are able to see here today.
        </li>
        <li>While it may look not much, the work underneath the surface is enormous.</li>
        <li>
          First, I had to learn websockets. It looked simple. "Woah, developing an online game is
          much easier than I expected" – I remember thinking. Oh, boy... If I knew what I know now,
          I would have stopped right there. Next, encouraged by how easy it looks, I craved for
          complexities.
        </li>
        <li>
          I installed matter.js to add some realistic physics and smooth movements to the game.
          After a few days of playing around with matter.js, I was happy with how fancy the game
          felt! I tested it in several browser windows and it was just flawlessly smooth.
        </li>
        <li>
          Finally, happy and enthusiastic I'm going ahead with publishing it on Adaptable & Netlify.
          Whoops....
        </li>
        <li>Glitching, wobbling, and jittering.</li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
li {
  padding-bottom: 10px;
}
</style>
