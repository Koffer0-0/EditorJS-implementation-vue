<template>
    <div ref="editor" class="w-full ml-5 editor-content text-white" data-cy="baseEditor"></div>
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
import AlignmentBlockTune from '@/components/text editor/alignmentTool'
import {logger} from "@/services/utils/logger";
import { useCourse } from '@/composables/lms/useCourse';

const editor = ref(null)
const editorInstance = ref(null)
const emit = defineEmits(['contentChanged', 'upload-image', 'upload-content'])
const content = inject('content', { blocks: [] })
const readMode = inject('readMode', false)
const { uploadImageForTextEditor } = useLecture()
const { uploadImageForWalkthrough } = useLab()
const { uploadImageForCourseContent } = useCourse();

const props = defineProps({
  id: [Number, String],
  type: { type: String },
})

onMounted(() => {
  initializeEditor()
})

function initializeEditor() {
  editorInstance.value = new EditorJS({
    holder: editor.value,
    minHeight : 300,
    readOnly: readMode.value,
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
              const formData = new FormData()

              // Determine the upload context and construct the URL accordingly
              let uploadContext
              let response
              console.log(props.type);
              if (props.type === 'lecture') {
                formData.append('lecture-image', file) // Use the appropriate form key
                uploadContext = 'lectures'
                response = await uploadImageForTextEditor(props.id, formData)
              } else if (props.type === 'lab') {
                formData.append('lab-image', file) // Use the appropriate form key
                uploadContext = 'labs' // Adjust based on your actual path or parameter
                response = await uploadImageForWalkthrough(props.id, formData)
              } else if (props.type === 'course') {
                formData.append("course-image", file); // Use the appropriate form key
                uploadContext = 'courses'; // Adjust based on your actual path or parameter
                response = await uploadImageForCourseContent(props.id, formData);
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
      }
    },
    tunes: ['alignText'],
    data: content.value,
    placeholder: 'Let`s write an awesome story!',
    onChange:  async () => {
      await saveData()
    },
    onReady: () => {
      const undo = new Undo({ editor: editorInstance.value });
    },
  })
}

const saveData = async () => {
  try {
    content.value = await editorInstance.value.save()
    emit('update-content')
  } catch (error) {
    logger.error('Saving failed: ', error)
  }
}

</script>
<style>
.ce-block__content,
.ce-toolbar__content {
  max-width: 1200px;
}

.ce-inline-toolbar,
.ce-inline-tool-input,
.ce-conversion-toolbar{
  background-color: rgba(42, 38, 38, 0.5);
}
.ce-block--selected,
.ce-conversion-toolbar,
.ce-conversion-tool__icon {
  color: #5e5858;
}
.ce-toolbar__plus,
.ce-toolbar__settings-btn,
.ce-conversion-toolbar,
.ce-conversion-toolbar__label {
  color: #000000;
  background-color: #ffffff;
}
.ce-toolbar__plus:hover,
.ce-toolbar__settings-btn:hover,
.ce-inline-toolbar__dropdown:hover,
.ce-inline-toolbar__buttons .ce-inline-tool:hover,
.ce-conversion-tool:hover,
::selection {
  background-color: gray;
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
