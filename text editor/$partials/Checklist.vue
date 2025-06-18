<script setup lang="ts">
import type { CheckListItem } from "@/utils/editor";
defineProps<{
  items: CheckListItem[];
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
  <div v-for="item in items" :class="`ml-8 flex ${align(alignment)} items-center`">
    <input :checked="item.checked" type="checkbox" class="checkbox" />
    <label class="checklist">{{ item.text }}</label>
  </div>
</template>
