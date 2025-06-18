<script setup lang="ts">
defineProps<{
  text: string;
}>();
</script>

<template>
  <p v-html="text" class="quote"/>
</template>
