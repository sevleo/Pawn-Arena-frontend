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
          The project came to life spontaneously and unintentionally. My initial goal was just to
          learn WebSockets, and I thought experimenting with them in the context of an online game
          would be fun. Little did I know, I'd find myself diving deeper into the rabbit hole of
          online game development complexities.
        </li>
        <li>
          I spend weeks not seeing any light at the end of the tunnel and almost ready to give up,
          but still holding onto the belief and coming back to it, day after day. Eventually, I
          proudly end up with the result that you can see here today.
        </li>
        <li>While it may look like not much, the work behind the scenes is enormous.</li>
        <li>
          First, I learn WebSockets. They look simple. "Woah, developing an online game is much
          easier than I expected" – I am thinking. Oh, boy... If I knew what I know now, I would
          have stopped right there. Next, encouraged by how easy it looks, I crave more complexity.
        </li>
        <li>
          I install matter.js to bring in realistic physics and smooth movements. After a few days
          of tinkering, I am happy with how smooth the game feels. I test it in several browser
          windows and everything works flawlessly.
        </li>
        <li>Happy and enthusiastic, I'm deploying it on Adaptable.io & Netlify. Whoops....</li>
        <li>
          Glitching, wobbling, and jittering were everywhere. Unplayable. After some googling, I
          switch from Adaptable.io to Fly.io. Still completely unplayable, although slightly better.
        </li>
        <li>
          Next, deciding that Redis is going to be the panacea. Spoiler alert – it is not. Although
          it is definitely nice to learn a little about it, I am lucky to quickly realize that I'm
          digging into a completely wrong direction here.
        </li>
        <li>
          As I'm reseraching the question deeper, I begin to encounter some terms that I would soon
          spend an absurd amount of time trying to understand.
        </li>
        <li>These terms were Client Prediction, Reconciliation, and Interpolation.</li>
        <li>
          These are the techniques vital for combating the lag (wobbling and jittering) caused by
          unstable ping and latency in online game development.
        </li>
        <li>
          I come across some fundamental articles that finally help me solidify my understanding of
          the underlying problem. These are must-reads for anyone building an online game with
          real-time, live actions. The first is
          <a
            href="https://developer.valvesoftware.com/wiki/Latency_Compensating_Methods_in_Client/Server_In-game_Protocol_Design_and_Optimization"
            target="_blank"
            >Server In-game Protocol Design and Optimization</a
          >, the second is
          <a
            href="https://www.gabrielgambetta.com/client-server-game-architecture.html"
            target="_blank"
            >Fast-Paced Multiplayer (Part I): Client-Server Game Architecture</a
          >.
        </li>
        <li>
          To sum it up: latency is unreliable and fluctuates. When the state of the game is
          controlled by the authoritative server and not by the client (that's how we want it to be
          to prevent cheating), any delays or lost messages due to latency affect the game's
          smoothness.
        </li>
        <li>
          Every action on the client side must be processed by the server before the result is
          displayed. In fast-paced games, this delay – anywhere from 0.01 to 2+ seconds – makes
          gameplay impossible.
        </li>
        <li>
          This is where Client Prediction, Reconciliation, and Interpolation come in to save the
          day.
        </li>
        <li>
          I won’t go into great detail since the articles do an excellent job explaining, but here’s
          a quick intro to each technique:
        </li>
        <li>
          <span class="font-extrabold">Client Prediction</span> – this technique allows the player
          to see immediate feedback for their own actions. Instead of waiting for the server to
          return new coordinates after a movement request, the client predicts and applies them
          proactively.
        </li>
        <li>
          But what happens if another player, Player B, is already moving into the space predicted
          for Player A? In this case, Player A’s client predicts a 100px move, but the server might
          limit the move to 50px due to Player B’s presence. This is where
          <span class="font-extrabold">Reconciliation</span> comes in.
        </li>
        <li>
          Reconciliation adjusts the client’s predicted position based on server data. The client
          rolls back the predictions made after the reconciliation point and recalculates them using
          the updated server info. This process is subtle and doesn’t happen too often, as most of
          the time, predictions are fairly accurate.
        </li>
        <li>
          <span class="font-extrabold">Interpolation</span> – This technique is critical when
          predicting other players’ movements. Since we can’t predict their actions, we create the
          illusion of smoothness by playing back past movements.
        </li>
        <li>
          We define an acceptable delay (let's say 200ms). When the server calculates new player
          positions and broadcasts them, clients don’t apply them immediately. Instead, they buffer
          the positions and apply them after the delay. This gives the impression that everything is
          in sync, even though each client experiences the game with a small delay.
        </li>

        <li>
          Now, back to my project. Having learnt of the theory, and even having a semi-functional
          code from one of the articles, I think implementing it will be easy. Well, it is not. It
          took me about a full week to just implement the smooth movement of the entities.
        </li>
        <li>
          Trying to use Matter.js again. Failed. It doesn’t support online gaming. I can't find a
          workaround.
        </li>
        <li>
          Giving the lance-gg library a shot. It looks promising at first but turns out to be
          outdated and doesn't work for my needs.
        </li>
        <li>
          Deciding to continue with my own implementation of the networking part of the game and
          giving up on physics.
        </li>
        <li>Spending weeks fine-tuning the networking aspect, and finally begin adding bullets.</li>
        <li>
          Struggling with collisions, deciding to use matter.js just for collision management.
          Success! That's unexpected.
        </li>
        <li>
          At this point, I finally have something that looks like a game, albeit lacking some real
          gameplay components. Spending next few days adding simple gameplay mechanics such as
          health, spawn/respawn, game boundaries.
        </li>
        <li>
          I started this project on July 13, and by July 20, the game already looked like what you
          see now - though better with the physics engine. Then it takes me another 6 weeks of
          working just on the networking part of the game. That gives a pretty good measure of how
          much more difficult developing an online game is compared to developing a regular one.
        </li>
        <li>
          Having gone through this journey I am reflecting that for the past 2 months I did not
          advance as much as a game developer as a network infrastructure developer. Not exactly
          what I was expecting but a good experience nontheless. Moreover, I am confident at this
          point that if ever there comes a times when I will have an idea for a real online game
          with live action, I have the tools in my belt to be able to do it. That alone was worth
          the walk.
        </li>
        <li>
          If you somehow find yourself on a similar journey, first, my condolences. Second, don't
          hesitate to contact me and I would be happy to help where I can. I know how hard it is to
          figure all this out alone, especially since there's so little information online, and AI
          ins't all that helpful with these issues.
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
li {
  padding-bottom: 10px;
}
</style>
