<script setup lang="ts">
import type { Embed } from "@/utils/editor";

defineProps<{
  embed: Embed;
  // caption: string;
}>();

function align(position: string) {
  switch (position) {
    case "center":
      return "justify-center";
    case "right":
      return "justify-end";
    case "left":
      return "justify-start";
  }
}
</script>

<template>
  <div
    :class="`flex ${align(
      embed.tunes.alignText.alignment,
    )} h-[32rem] border-4 shadow-xl border-gray-800`"
  >
    <iframe
      v-if="embed.data.service === 'youtube'"
      class="w-full h-full"
      :src="embed.data.embed"
      title="YouTube video player"
      frameborder="1"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowfullscreen
    ></iframe>
  </div>

  <div class="flex justify-center gap-2 mb-2 uppercase tracking-wider">
    <p class="mt-4 text-gray-400 italic">{{ embed.data.caption }}</p>
  </div>
</template>
