<script setup lang="ts">

defineProps<{
  text: string;
  level: number;
  alignment: string;
}>();
</script>
<template>
  <!-- Headers -->
  <p :class="`h${level} text-${alignment}`">
    {{ text }}
  </p>
</template>
