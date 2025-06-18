<script setup lang="ts">
import type { Table } from "@/utils/editor";
defineProps<{
  table: Table;
}>();

</script>

<template>
  <table class="table">
    <tbody>
      <tr class="table-row" v-for="row in table.data.content">
        <td class="table-d" v-for="field in row">
          {{ field }}
        </td>
      </tr>
    </tbody>
  </table>
</template>
