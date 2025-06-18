<script setup lang="ts">
import type { Raw } from "@/utils/editor";
defineProps<{
  raw: Raw;
}>();
</script>

<template>
  <div class="text-gray-400" v-html="raw.data.html" />
</template>
