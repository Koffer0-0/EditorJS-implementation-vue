<script setup lang="ts">
import { ref } from "vue";
import IconCopy from "@/components/icons/IconCopy.vue";
import IconCheckMark from "@/components/icons/IconCheckSquare.vue";
const props = defineProps<{
  text: string;
}>();

const copied = ref<boolean>(false);

function copy() {
  copied.value = true;
  navigator.clipboard.writeText(props.text);
  setTimeout(() => {
    copied.value = false;
  }, 1500);
}
</script>

<template>
  <div class="relative">
    <code class="code overflow-x-scroll scrollbar">
      <IconCopy v-if="!copied" @click="copy()" class="code-icon" />
      <IconCheckMark v-else class="code-icon" />
      <pre class="break-all">{{ text }}</pre>
    </code>
  </div>
</template>
