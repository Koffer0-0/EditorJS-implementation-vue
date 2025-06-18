<template>
  <div class="overflow-y-auto overflow-x-hidden max-h-[500px] my-2">
    <div ref="editor" class="editor-content dark:text-gray-100"></div>
  </div>
</template>

<script setup>
import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header';
import List from '@editorjs/list';
import Checklist from '@editorjs/checklist';
import Quote from '@editorjs/quote';
import Code from '@editorjs/code';
import InlineCode from '@editorjs/inline-code';
import LinkTool from '@editorjs/link';
import Marker from '@editorjs/marker';
import RawTool from '@editorjs/raw';
import Table from '@editorjs/table';
import Warning from '@editorjs/warning';
import Embed from '@editorjs/embed';
import {onMounted, ref, defineEmits, inject} from "vue";
import {useLecture} from "@/composables/lms/useLecture";
import {useLab} from "@/composables/lms/useLab";
import {LMS} from "@/services/utils/consts";
import CustomImage from "@/components/text editor/customImageTool";
import AlignmentBlockTune from "@/components/text editor/alignmentTool";
import {useCourse} from "@/composables/lms/useCourse";
import {logger} from "@/services/utils/logger";

const editor = ref(null);
const editorInstance = ref(null);
const introContent = inject('introContent', { blocks: [] })

const props = defineProps({
  labId: {},
  courseId: {},
})

onMounted(() => {
  initializeEditor();
});

const {uploadImageForWalkthrough} = useLab();
const {uploadImageForCourseContent} = useCourse();

function initializeEditor() {
  editorInstance.value = new EditorJS({
    holder: editor.value,
    minHeight : 300,
    // readOnly: true, //is possible
    tools: {
      checklist: {
        class: Checklist,
        inlineToolbar: true, // Enable inline toolbar for lists
      },
      code: {
        class: Code,
        inlineToolbar: true
      },
      embed: {
        class: Embed,
        inlineToolbar: true
      },
      header: {
        class: Header,
        config: {
          placeholder: 'Enter a header',
          levels: [1, 2, 3, 4],
          defaultLevel: 1,
        }
      },
      image: {
        class: CustomImage,
        config: {
          uploader: {
            async uploadByFile(file) {
              handleUploadFile(file)
            }
          },
        },
      },
      inlineCode: {
        class: InlineCode,
        inlineToolbar: true
      },
      linkTool: {
        class: LinkTool,
        inlineToolbar: true,
      },
      list: {
        class: List,
        inlineToolbar: true, // Enable inline toolbar for lists
      },
      marker: {
        class: Marker,
        inlineToolbar: true
      },
      quote: {
        class: Quote,
        inlineToolbar: true, // Enable inline toolbar for lists
      },
      raw: RawTool,
      table: {
        class: Table,
        inlineToolbar: true,
        config: {
          rows: 2,
          cols: 3,
        },
      },
      warning: {
        class: Warning,
        inlineToolbar: true,
        // shortcut: 'shortcuts are possible',
        config: {
          titlePlaceholder: 'Title',
          messagePlaceholder: 'Message',
        },
      },
      alignText: {
        class: AlignmentBlockTune,
        config: {
          default: "left",
          blocks: {
            header: 'center',
            list: 'right'
          }
        },
      },
    },
    tunes: ['alignText'],
    data: introContent.value,
    placeholder: 'Let`s write an awesome story!',
    onChange: saveData
  });
}

const saveData = async () => {
  try {
    introContent.value = await editorInstance.value.save();
  } catch (error) {
    logger.error('Saving failed: ', error);
  }
};

const handleUploadFile = async (file) => {
  const formData = new FormData();

  // Determine the upload context and construct the URL accordingly
  let uploadContext;
  let response;

  if (props.labId) {
    formData.append("lab-image", file); // Use the appropriate form key
    uploadContext = 'labs'; // Adjust based on your actual path or parameter
    response = await uploadImageForWalkthrough(props.labId, formData);
  }
  else if (props.courseId) {
    formData.append("course-image", file); // Use the appropriate form key
    uploadContext = 'courses'; // Adjust based on your actual path or parameter
    response = await uploadImageForCourseContent(props.courseId, formData);
  } else {
    // Handle cases where neither ID is available
    logger.error("No valid ID available for uploading");
    return { success: 0 }; // Indicate failure if no context is available
  }

  // Check response validity
  if (response && response.result) {
    return {
      success: 1,
      file: {
        url: `${LMS}/images/${uploadContext}/${response.result}`,
      }
    };
  } else {
    // Handle cases where the response is not as expected
    logger.error("Invalid response from the server");
    return { success: 0 }; // Indicate failure if the response is invalid
  }
}

</script>
<style>
.dark .ce-inline-toolbar,
.dark .ce-inline-tool-input,
.dark .ce-conversion-toolbar{
  background-color: rgba(42, 38, 38, 0.5);
}
.dark .ce-block--selected,
.dark .ce-conversion-toolbar,
.dark .ce-conversion-tool__icon {
  color: #282727;
}
.dark .ce-toolbar__plus,
.dark .ce-toolbar__settings-btn,
.dark .ce-conversion-toolbar{
  color: aliceblue;
  background-color: gray;
}

.dark .ce-toolbar__plus:hover,
.dark .ce-toolbar__settings-btn:hover,
.dark .ce-inline-toolbar__dropdown:hover,
.dark .ce-inline-toolbar__buttons .ce-inline-tool:hover,
.dark .ce-conversion-tool:hover,
.dark ::selection {
  background-color: gray; /* Adjust the color as needed */
}

h1.ce-header {
  @apply text-4xl font-bold; /* Example Tailwind classes for <h1> */
}

h2.ce-header {
  @apply text-3xl font-semibold; /* Example Tailwind classes for <h2> */
}

h3.ce-header {
  @apply text-2xl font-medium; /* Example Tailwind classes for <h3> */
}

h4.ce-header {
  @apply text-xl font-normal; /* Example Tailwind classes for <h4> */
}
</style>