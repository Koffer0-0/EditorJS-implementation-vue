<template>
  <slot name="triggerButton">
    <BaseButton
      :btn-text="buttonText"
      color="gray"
      :icon="IconTextEditor"
      @click="triggerModal(MODAL_ID_TEXT_INTRO)"
    />
  </slot>

  <!-- сюда передается isOpen внутри передавая id модалки, и нужно еще передать modalId отдельно тоже -->
  <BaseModal :isOpen="isOpen(MODAL_ID_TEXT_INTRO)" :modal-id="MODAL_ID_TEXT_INTRO" :title="buttonText">
    <!--  Здесь можно передать любой же контент в модальное окно  -->
    <template #main-content>
      <div class="overflow-y-scroll max-h-[500px]">
        <IntroContent/>
      </div>
    </template>
    <!--  Передается кнопка, перезаписывая ту кнопку по умолчанию  -->
    <template #footer>
      <br>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import BaseButton from "../base/BaseButton.vue";
import BaseModal from "@/components/base/BaseModal.vue";
import {useModal} from "@/composables/useModal";
import {
  ref,
  inject,
  defineAsyncComponent
} from "vue";
import IntroContent from "@/components/text editor/IntroContent.vue";
import WarningMessage from "@/components/common/WarningMessage.vue";
import {MODAL_ID_TEXT_INTRO} from "@/services/utils/modalIds";

const IconTextEditor = defineAsyncComponent(() => import('@/components/icons/IconTextEditor.vue'));

defineProps({
  buttonText: {
    type: String,
    default: "Content"
  }
})

// Нужно чтобы отправлять события в родительский компонент
const emit = defineEmits([]);

const {isOpen, openModal, closeModal} = useModal();
const triggerModal = async (id) => {
  openModal(id);
};
</script>
