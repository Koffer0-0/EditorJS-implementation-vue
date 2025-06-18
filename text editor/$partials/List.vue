<script setup lang="ts">
import type { ListStyle } from "@/utils/editor";
defineProps<{
  items: string[];
  style: ListStyle;
  alignment: string;
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
  <div :class="`flex ${align(alignment)} items-center`">
    <ul class="ml-8" v-if="style === 'unordered'">
      <li class="mb-4" v-for="item in items">
        <span class="text-blue-500">&#x25CF;</span>
        <p class="inline ml-2 text-gray-400" v-html="item" />
      </li>
    </ul>

    <ol class="ml-8" v-else>
      <li v-for="item in items" class="mb-4">
        <span class="text-blue-500">&#x25CF;</span>
        <p class="inline ml-2 text-gray-400" v-html="item" />
      </li>
    </ol>
  </div>
</template>
