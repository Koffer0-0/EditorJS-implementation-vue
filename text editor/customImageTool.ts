import Image from "@editorjs/image"
import {useLecture} from "@/composables/lms/useLecture";
import {useLab} from "@/composables/lms/useLab";
import {useCourse} from "@/composables/lms/useCourse";
import {logger} from "@/services/utils/logger";
const {deleteImageForTextEditor} = useLecture();
const {deleteImageForWalkthrough} = useLab();
const {deleteImageForCourseContent} = useCourse();
class CustomImage extends Image {
    removed() {
        const { file } = this._data;

        const imageUrlParts = file.url.split('/').pop().split('-'); // Splits the URL to get the last segment and then splits by '-'
        let context, id;
        const image_uuid = file.url.split('/').pop()
        if (imageUrlParts[0] === 'lab' && imageUrlParts.length > 1) {
            context = 'lab';
            id = imageUrlParts[1]; // Assuming the second part is the lab ID
            deleteImageForWalkthrough(id, image_uuid).then(response => {
                // Handle response
                logger.log('Image deleted for lab:', response);
            }).catch(error => {
                logger.error('Failed to delete lab image:', error);
            });
        }
        if (imageUrlParts[0] === 'lecture' && imageUrlParts.length > 1) {
            context = 'lecture';
            id = imageUrlParts[1]; // Assuming the second part is the lab ID
            deleteImageForTextEditor(id, image_uuid).then(response => {
                // Handle response
                logger.log('Image deleted for lecture:', response);
            }).catch(error => {
                logger.error('Failed to delete lecture image:', error);
            });
        }
        if (imageUrlParts[0] === 'course' && imageUrlParts.length > 1) {
            context = 'course';
            id = imageUrlParts[1]; // Assuming the second part is the lab ID
            deleteImageForCourseContent(id, image_uuid).then(response => {
                // Handle response
                logger.log('Image deleted for Course:', response);
            }).catch(error => {
                logger.error('Failed to delete Course image:', error);
            });
        }
    }
}

export default CustomImage