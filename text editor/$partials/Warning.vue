<script setup lang="ts">
import IconWarning from "@/components/icons/IconWarning.vue";
defineProps<{
  title: string;
  message: string;
}>();
</script>

<template>
  <div class="warning">
    <IconWarning class="h-10 w-10 mr-2"/>
    <div>
      <p class="title">{{ title }}</p>
      <p class="italic">{{ message }}</p>
    </div>
  </div>
</template>
