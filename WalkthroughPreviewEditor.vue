<template>
  <div class="bg-gray-900">
    <PreviewHeader :statusCounter="statusCounter" :read-mode="readMode"/>
    <section class="h-screen">
      <div class="bg-gray-900">
        <div
          class="flex flex-col justify-center w-full items-center mb-10 pl-16 pr-16 mt-10 border-b pb-8 border-gray-800 drop-shadow-xl shadow-2xl">
          <IconBook/>
          <PreviewTitle :title="title"/>
        </div>
        <div @click="toggleEditMode" class="grid grid-rows-1 break-all text-lg max-w-6xl 2xl:mx-auto mx-12 pb-20 scrollbar-hidden scalable-img">
          <Editor v-if="!readMode"
                  :id="id"
                  type="lab"
                  @upload-image="getImageBasedOnType"
                  @update-content="onContentEdit"
          />
          <section v-else class="max-w-6xl">
            <div class="text-gray-500 text-center" v-if="content.blocks.length === 0">
                Tap here to start writing content
            </div>
            <EditorOutput v-else :blocks="content.blocks"/>
          </section>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, provide, ref } from 'vue';
import Editor from '@/views/editor/Editor.vue';
import EditorOutput from '@/components/editortest/EditorOutput.vue';
import { useRoute } from 'vue-router';
import { useLab } from '@/composables/lms/useLab';
import IconBook from '@/components/icons/IconBook.vue';
import PreviewHeader from '@/views/editor/$partials/PreviewHeader.vue';
import PreviewTitle from '@/views/editor/$partials/PreviewTitle.vue';

const content = ref({
  blocks: []
});
const readMode = ref(true)
const id = ref(null)
const item = ref(null)
const title = ref('Default Title')
const statusCounter = ref(0)
const hasChanges = ref(false)
let timeout

provide('content', content);
provide('readMode', readMode);

const { uploadImageForWalkthrough, handleUpdateLabContent, getLabById } = useLab()

onMounted(() => {
  const route = useRoute();
  console.log(route);
  id.value = route.params.id;
  if (id.value) {
    fetchData(route.params.id);
  }
  window.addEventListener('keydown', startAutoSaveTimeout)
  window.addEventListener('mousemove', startAutoSaveTimeout)
})

const toggleEditMode = () => {
  readMode.value = false
  statusCounter.value++
  if (readMode.value) {
    startAutoSaveTimeout()
  } else {
    clearTimeout(timeout)
  }
}

const startAutoSaveTimeout = () => {
  clearTimeout(timeout)
  timeout = setTimeout(async () => {
    readMode.value = true
    if (statusCounter.value > 0) {
      await getUpdateContentBasedOnType()
    }
  }, 2000) // 2 seconds of inactivity
}

// Cleanup timeout on component unmount
onBeforeUnmount(() => {
  clearTimeout(timeout)
})

const onContentEdit = () => {
  hasChanges.value = true  // Set flag to true when content is modified
}

const getCallFunctionBasedOnType = async (id) => {
    const {name: title, content} = await getLabById(id)
    return {title, content}
}

const getUpdateContentBasedOnType = async () => {
  if (!hasChanges.value) {
    return
  }

  const tempId = id.value;
  const payload = {
    content: JSON.stringify(content.value)
  }

  await handleUpdateLabContent(tempId, payload)

  hasChanges.value = false
}

const getImageBasedOnType = async () => {
    return uploadImageForWalkthrough;
}

const fetchData = async (id) => {
  const response = await getCallFunctionBasedOnType(id);
  item.value = response
  const contentRaw = response.content ? JSON.parse(response.content) : '';
  content.value = contentRaw;
  title.value = response.title;
}

</script>

<style scoped lang="sass">
</style>
