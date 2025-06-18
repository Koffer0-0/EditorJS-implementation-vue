<template>
  <div>
  <BaseButton
    btn-text="preview"
    color="gray"
    :icon="IconEyeOpen"
    @click="triggerModal(MODAL_ID_TEXT_PREVIEW)"
  />
  <!-- сюда передается isOpen внутри передавая id модалки, и нужно еще передать modalId отдельно тоже -->
  <BaseModal :isOpen="isOpen(MODAL_ID_TEXT_PREVIEW)" :modal-id="MODAL_ID_TEXT_PREVIEW" title="preview">
    <!--  Здесь можно передать любой же контент в модальное окно  -->
    <template #main-content>
      <div class="overflow-y-scroll max-h-[500px] dark:text-white text-gray-500">
        <template v-for="b in content.blocks" class="editor">
          <!-- Headers -->
          <HeaderComponent
              :alignment="(b as Header).tunes.alignText.alignment"
              :text="(b as Header).data.text"
              :level="(b as Header).data.level"
              v-if="(b as Header).type === 'header'"
          />

          <CodeComponent :text="(b as Code).data.code" v-if="b.type == 'code'" />

          <ChecklistComponent
              v-if="b.type == 'checklist'"
              :items="(b as Checklist).data.items"
              :alignment="(b as Checklist).tunes.alignText.alignment"
          />

          <p class="paragraph" v-if="b.type == 'paragraph'" v-html="(b as Paragraph).data.text" />

          <ImageComponent
              v-if="b.type == 'image'"
              :url="(b as Image).data.file.url"
              :alignment="(b as Image).tunes.alignText.alignment"
          />

          <QuoteComponent v-if="b.type == 'quote'" :text="(b as Quote).data.text" />

          <WarningComponent
              v-if="b.type == 'warning'"
              :title="(b as Warning).data.title"
              :message="(b as Warning).data.message"
          />

          <ListComponent
              v-if="b.type == 'list'"
              :items="(b as List).data.items"
              :style="(b as List).data.style"
              :alignment="(b as List).tunes.alignText.alignment"
          />

          <TableComponent v-if="b.type == 'table'" :table="b as Table" />

          <RawComponent v-if="b.type == 'raw'" :raw="b as Raw" />
          <EmbedComponent v-if="b.type == 'embed'" :embed="b as Embed" />

          <p><br /></p>
        </template>      </div>
    </template>
    <!--  Передается кнопка, перезаписывая ту кнопку по умолчанию  -->
    <template #footer>
      <br>
    </template>
  </BaseModal>
  </div>
</template>

<script setup lang="ts">
import type {
  Block,
  Header,
  Quote,
  Raw,
  Table,
  Code,
  Warning,
  Checklist,
  List,
  Paragraph,
  Image,
  Embed,
} from "@/services/utils/editor";
import BaseButton from "../base/BaseButton.vue";
import BaseModal from "@/components/base/BaseModal.vue";
import { useModal } from "@/composables/useModal";
import {
  inject,
  defineAsyncComponent
} from "vue";
import CodeComponent from "@/components/text editor/$partials/Code.vue";
import TableComponent from "@/components/text editor/$partials/Table.vue";
import EmbedComponent from "@/components/text editor/$partials/Embed.vue";
import HeaderComponent from "@/components/text editor/$partials/Header.vue";
import WarningComponent from "@/components/text editor/$partials/Warning.vue";
import QuoteComponent from "@/components/text editor/$partials/Quote.vue";
import RawComponent from "@/components/text editor/$partials/Raw.vue";
import ListComponent from "@/components/text editor/$partials/List.vue";
import ChecklistComponent from "@/components/text editor/$partials/Checklist.vue";
import ImageComponent from "@/components/text editor/$partials/Image.vue";
import {MODAL_ID_TEXT_PREVIEW} from "@/services/utils/modalIds";

const IconEyeOpen = defineAsyncComponent(() => import('@/components/icons/IconEyeOpen.vue'));

const {isOpen, openModal, closeModal} = useModal();

const content = inject('content', { blocks: [] });

const alignmentClass = (alignment) => {
  return {
    'text-left': alignment === 'left',
    'text-center': alignment === 'center',
    'text-right': alignment === 'right'
  };
}
const headerSize = (level) => {
  switch (level) {
    case 1: return '3xl'; // h1
    case 2: return '2xl'; // h2
    case 3: return 'xl';  // h3
    default: return 'lg';  // default for other headers
  }
};
const triggerModal = async (id) => {
  openModal(id);
}
</script>
