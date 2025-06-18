<template>
  <div class="overflow-y-auto overflow-x-hidden max-h-[500px] my-2">
    <div ref="editor" class="editor-content dark:text-gray-100"></div>
  </div>
</template>

<script setup>
import EditorJS from '@editorjs/editorjs'
import Header from '@editorjs/header'
import List from '@editorjs/list'
import Checklist from '@editorjs/checklist'
import Quote from '@editorjs/quote'
import Code from '@editorjs/code'
import InlineCode from '@editorjs/inline-code'
import LinkTool from '@editorjs/link'
import Marker from '@editorjs/marker'
import RawTool from '@editorjs/raw'
import Table from '@editorjs/table'
import Warning from '@editorjs/warning'
import Embed from '@editorjs/embed'
import Undo from 'editorjs-undo';

import { onMounted, ref, inject } from 'vue'
import { useLecture } from '@/composables/lms/useLecture'
import { useLab } from '@/composables/lms/useLab'
import { LMS } from '@/services/utils/consts'
import CustomImage from '@/components/text editor/customImageTool'
import { MDImporter, MDParser } from '@/services/editorjs-parser/src'
import AlignmentBlockTune from '@/components/text editor/alignmentTool'
import {logger} from "@/services/utils/logger";

const editor = ref(null)
const editorInstance = ref(null)
const emit = defineEmits(['contentChanged'])
const content = inject('content', { blocks: [] })
const { uploadImageForTextEditor, handleUpdateLectureContent } = useLecture()
const { uploadImageForWalkthrough, handleUpdateLabContent } = useLab()

const props = defineProps({
  lectureId: {},
  labId: {},
})

onMounted(() => {
  initializeEditor()
})

function initializeEditor() {
  editorInstance.value = new EditorJS({
    holder: editor.value,
    minHeight : 300,
    // readOnly: true, //is possible
    tools: {
      checklist: {
        class: Checklist,
        inlineToolbar: true // Enable inline toolbar for lists
      },
      code: {
        class: Code,
        inlineToolbar: true
      },
      embed: {
        class: Embed,
        inlineToolbar: true,
        config: {
          services: {
            googleForms: {
              regex: /https:\/\/docs\.google\.com\/forms\/d\/e\/([a-zA-Z0-9_-]+)/,
              embedUrl: 'https://docs.google.com/forms/d/e/<%= remote_id %>/viewform?embedded=true',
              html: "<iframe width='640' height='520' frameborder='0' marginheight='0' marginwidth='0'></iframe>",
              height: 520,
              width: 640,
              id: (groups) => groups[0]
            },
            microsoftForms: {
              regex: /https:\/\/forms\.office\.com\/Pages\/ResponsePage\.aspx\?id=([a-zA-Z0-9_-]+)/,
              embedUrl:
                'https://forms.office.com/Pages/ResponsePage.aspx?id=<%= remote_id %>&embed=true',
              html: "<iframe width='640' height='520' frameborder='0' marginheight='0' marginwidth='0'></iframe>",
              height: 520,
              width: 640,
              id: (groups) => groups[0]
            }
          }
        }
      },
      header: {
        class: Header,
        config: {
          placeholder: 'Enter a header',
          levels: [1, 2, 3, 4],
          defaultLevel: 1
        }
      },
      image: {
        class: CustomImage,
        config: {
          uploader: {
            async uploadByFile(file) {
              handleUploadFile(file)
            }
          }
        }
      },
      inlineCode: {
        class: InlineCode,
        inlineToolbar: true
      },
      linkTool: {
        class: LinkTool,
        inlineToolbar: true
      },
      list: {
        class: List,
        inlineToolbar: true // Enable inline toolbar for lists
      },
      marker: {
        class: Marker,
        inlineToolbar: true
      },
      quote: {
        class: Quote,
        inlineToolbar: true // Enable inline toolbar for lists
      },
      raw: RawTool,
      table: {
        class: Table,
        inlineToolbar: true,
        config: {
          rows: 2,
          cols: 3
        }
      },
      warning: {
        class: Warning,
        inlineToolbar: true,
        // shortcut: 'shortcuts are possible',
        config: {
          titlePlaceholder: 'Title',
          messagePlaceholder: 'Message'
        }
      },
      alignText: {
        class: AlignmentBlockTune,
        config: {
          default: 'left',
          blocks: {
            header: 'center',
            list: 'left'
          }
        }
      },
      markdownParser: MDParser,
      markdownImporter: MDImporter
    },
    tunes: ['alignText'],
    data: content.value,
    placeholder: 'Let`s write an awesome story!',
    onChange:  async () => {
      await saveData()
    },
    onReady: () => {
      const undo = new Undo({ editor: editorInstance.value });
      console.log(undo);
    },
  })
}

const saveData = async () => {
  try {
    content.value = await editorInstance.value.save()
    if (props.labId) {
      const payload = {
        content: JSON.stringify(content.value)
      }
      await handleUpdateLabContent(props.labId, payload)
    }
    if (props.lectureId) {
      const payload = {
        content: JSON.stringify(content.value)
      }
      await handleUpdateLectureContent(props.lectureId, payload)
    }
  } catch (error) {
    logger.error('Saving failed: ', error)
  }
}

const handleUploadFile = async (file) => {
    const formData = new FormData()

    // Determine the upload context and construct the URL accordingly
    let uploadContext
    let response

    if (props.lectureId) {
      formData.append('lecture-image', file) // Use the appropriate form key
      uploadContext = 'lectures'
      response = await uploadImageForTextEditor(props.lectureId, formData)
    } else if (labId && labId.value) {
      formData.append('lab-image', file) // Use the appropriate form key
      uploadContext = 'labs' // Adjust based on your actual path or parameter
      response = await uploadImageForWalkthrough(labId.value, formData)
    } else {
      // Handle cases where neither ID is available
      logger.error('No valid ID available for uploading')
      return { success: 0 } // Indicate failure if no context is available
    }

    // Check response validity
    if (response && response.result) {
      return {
        success: 1,
        file: {
          url: `${LMS}/images/${uploadContext}/${response.result}`
          // Add additional fields if necessary
        }
      }
    } else {
      // Handle cases where the response is not as expected
      logger.error('Invalid response from the server')
      return { success: 0 } // Indicate failure if the response is invalid
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
