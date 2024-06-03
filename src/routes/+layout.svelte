<script lang="ts">
  import { onMount } from "svelte";

  // detect service worker updates and reload the page
  async function detectSWUpdate() {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      registration.addEventListener("updatefound", () => {
        const newWorker = registration.installing;
        newWorker?.addEventListener("statechange", () => {
          if (newWorker.state === "installed") {
            if (navigator.serviceWorker.controller) {
              alert("New content is available. Click OK to refresh.");
              newWorker.postMessage({ type: "SKIP_WAITING" });
              window.location.reload();
            }
          }
        });
      });
    }
  }

  onMount(detectSWUpdate);
</script>

<slot  />

<svelte:head>
  <title>Speed Word!</title>
</svelte:head>