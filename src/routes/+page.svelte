<script lang="ts">
  import { onMount } from "svelte";
  import { currWord } from "$lib/stores";
  import { getRandomWord, getDefinition } from "$lib/util";

  let remainingTime = 0;
  let isOffline = false;

  function setCurrentWord() {
    getRandomWord()
      .then((word) =>
        getDefinition(word).then((definition) => {
          console.log("Received", word, definition);

          if (!word || !definition) return setCurrentWord();

          if (word === $currWord.word) {
            throw new Error("Offline!");
          }

          currWord.set({
            word,
            definition,
          });

          isOffline = false;

          remainingTime = 10;
          setTimeout(setCurrentWord, 10000);
        })
      )
      .catch(() => {
        isOffline = true;
        setTimeout(setCurrentWord, 1000);
      });
  }

  onMount(() => {
    setCurrentWord();

    let timerInterval = setInterval(() => {
      if (remainingTime > 0 && !isOffline) {
        remainingTime -= 1;
      }
    }, 1000);

    return () => clearInterval(timerInterval);
  });
</script>

<div class="container">
  <div>
    <h2 style="color: #d1d5db; text-align: center; font-style: italic;">
      Speed Word!
    </h2>
    <p
      style="color: #6b7280; text-align: center; margin-top: -1rem; font-style: italic;"
    >
      Discover a new word every 10 seconds.
    </p>
  </div>

  <div>
    <h1 class="theme-color">{$currWord?.word}</h1>

    {#if $currWord?.definition}
      <p>{$currWord?.definition}</p>
    {:else}
      <p>Wait for it ...</p>
    {/if}
  </div>

  {#if isOffline}
    <p style="color: #374151; text-align: center;">
      You are offline. Next word will be auto-fetched when you are back online.
    </p>
  {:else if remainingTime > 0}
    <p style="color: #374151; text-align: center;">
      Next word in {remainingTime} seconds.
    </p>
  {:else}
    <p style="color: #374151; text-align: center;">Fetching...</p>
  {/if}
</div>

<style>
  .container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    height: 100vh;
  }

  .container > * + * {
    padding-top: 2rem;
    padding-bottom: 2rem;
  }

  .theme-color {
    color: #ff3e00;
  }

  h1 {
    font-size: 2rem;
    margin-bottom: 1rem;
    text-transform: uppercase;
    text-align: center;
  }

  p {
    color: ghostwhite;
    font-size: 1rem;
    text-align: center;
  }
</style>
