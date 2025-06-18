<template>
  <div class="bg-gray-900">
    <PreviewHeader :statusCounter="statusCounter" :read-mode="readMode"/>
    <section class="h-screen">
      <div class="bg-gray-900">
        <div
          class="flex flex-col justify-center w-full items-center mb-10 pl-16 pr-16 mt-10 border-b pb-8 border-gray-800">
          <PreviewTitle :title="title"/>
        </div>
        <div @click="toggleEditMode" class="grid grid-rows-1 break-all text-lg max-w-6xl 2xl:mx-auto mx-12 pb-20 scrollbar-hidden scalable-img">
          <Editor v-if="!readMode"
                  :id="id"
                  :type="type"
                  @upload-image="getImageBasedOnType"
                  @update-content="onContentEdit"
          />
          <section v-else class="max-w-6xl">
            <div class="text-gray-500 text-center" v-if="content.blocks.length === 0" data-cy="baseTapContent">
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
import { useLecture } from '@/composables/lms/useLecture';
import { useCourse } from '@/composables/lms/useCourse';
import { useLab } from '@/composables/lms/useLab';
import PreviewHeader from '@/views/editor/$partials/PreviewHeader.vue';
import PreviewTitle from '@/views/editor/$partials/PreviewTitle.vue';

const content = ref({
  blocks: []
});
const readMode = ref(true)
const id = ref(null)
const item = ref(null)
const type = ref('')
const title = ref('Default Title')
const statusCounter = ref(0)
const hasChanges = ref(false)
let timeout

provide('content', content);
provide('readMode', readMode);

const { handleGetLecture, handleUpdateLectureContent, uploadImageForTextEditor } = useLecture();
const { getCourseById, handleUpdateCourse, uploadImageForCourseContent } = useCourse();
const { uploadImageForWalkthrough, handleUpdateLab, getLabById } = useLab()

onMounted(() => {
  const route = useRoute();
  console.log(route);
  id.value = route.params.id;
  type.value = route.params.type;
  if (id.value) {
    fetchData(route.params.id, route.params.type);
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

const getCallFunctionBasedOnType = async (id, type: string) => {
  if (type === 'lecture') {
    return await handleGetLecture(id)
  } else if (type === 'lab') {
    const {name: title, intro_content: content, level, config, time_to_complete_mins} = await getLabById(id)
    return {title, content, level, config, time_to_complete_mins}
  } else if (type === 'course') {
    const course = await getCourseById(id)
    const { name: title, intro_content: content, level, categories} = course;

    return { title, content, level, ...course, categories };
  }
}

const getUpdateContentBasedOnType = async () => {
  if (!hasChanges.value) {
    return
  }

  const tempId = id.value;
  let payload;
  payload = {
    content: JSON.stringify(content.value),
  }

  if (type.value === 'lecture') {
    await handleUpdateLectureContent(tempId, payload)
  } else if (type.value === 'lab') {
    payload = {
      intro_content: JSON.stringify(content.value),
      name: item.value.title,
      config: item.value.config,
      level: item.value.level,
      time_to_complete_mins: item.value.time_to_complete_mins,
    }

    await handleUpdateLab(tempId, payload);
  } else if (type.value === 'course') {
    payload = {
      intro_content: JSON.stringify(content.value),

      ...omit(item.value, ['intro_content', 'categories']),
      categories: [item.value.categories[0].id]
    }

    await handleUpdateCourse(tempId, payload);
  }

  hasChanges.value = false
}

function omit(obj, keys) {
  return Object.fromEntries(Object.entries(obj).filter(([key]) => !keys.includes(key)));
}

const getImageBasedOnType = async (type: string) => {
  if (type === 'lecture') {
    return uploadImageForTextEditor
  } else if (type === 'lab') {
    return uploadImageForWalkthrough;
  } else if (type === 'course') {
    return uploadImageForCourseContent
  }
}

const fetchData = async (id, type) => {
  const response = await getCallFunctionBasedOnType(id, type);
  item.value = response
  const contentRaw = response.content ? JSON.parse(response.content) : '';
  content.value = contentRaw;
  title.value = response.title;
}

</script>

<style scoped lang="sass">
</style>
