<script setup lang="ts">
defineProps<{
  url: string;
  alignment: string;
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
  <div :class="`flex ${align(alignment)}`">
    <img class="image" :src="url" />
  </div>
</template>
