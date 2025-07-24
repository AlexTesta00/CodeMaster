<script setup lang="ts">
import { onMounted, ref } from 'vue'
import CommentsComp from './CommentsComp.vue'
import type { Comment } from '../utils/interface.ts'
import { useAuthStore } from '../utils/store.ts'
import { addComment, getCommentsByQuest } from '../utils/api.ts'
import { errorToast } from '../utils/notify.ts'

const props = defineProps<{ questId: string }>()

const auth = useAuthStore()
const comments = ref<Comment[]>([])
const newComment = ref('')
const showComments = ref(false)
const isAnimating = ref(false)

const toggleComments = () => {
    if (showComments.value) {
        isAnimating.value = true
        showComments.value = false
        setTimeout(() => {
            isAnimating.value = false
        }, 300)
    } else {
        showComments.value = true
    }
}

const postComment = async () => {
    const nickname = auth.nickname
    if (nickname) {
        try {
            if (newComment.value.trim().length > 0) {
                const response = await addComment(
                    props.questId,
                    nickname,
                    newComment.value,
                )
                if (response.success) {
                    comments.value.push(response.result)
                    newComment.value = ''
                }
            }
        } catch (error) {
            await errorToast('Failed to add comment')
        }
    }
}

const formatDate = (input: string) => {
    const date = new Date(input)

    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()

    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')

    return `${day}/${month}/${year} ${hours}:${minutes}`
}

onMounted(async () => {
    try {
        const response = await getCommentsByQuest(props.questId)
        console.log('response: ', JSON.stringify(response, null, 2))
        if (response.success) {
            comments.value = response.result
        }
    } catch (error) {
        await errorToast('Failed to load comments')
    }
})
</script>

<template>
    <div class="fixed bottom-0 left-0 w-full z-50 flex flex-col items-start">
        <button
            @click="toggleComments"
            class="bg-gray-700 text-white flex items-center gap-1 shadow-lg hover:bg-gray-800 transition rounded-t-md px-3 py-1"
            aria-label="Toggle Comments"
        >
            <svg
                :class="{
                    'rotate-180 transition-transform duration-300':
                        showComments,
                }"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                class="w-5 h-5"
            >
                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 9l-7 7-7-7"
                />
            </svg>
            show comments
        </button>

        <section
            v-show="showComments || isAnimating"
            :class="['comment-panel', showComments ? 'fade-up' : 'fade-down']"
            style="backdrop-filter: blur(8px)"
        >
            <h3 class="text-lg font-semibold mb-3">Comments</h3>

            <div v-if="comments.length > 0" class="space-y-2">
                <comments-comp
                    v-for="(comment, idx) in comments"
                    :key="idx"
                    :author="comment.author"
                    :timestamp="formatDate(comment.timestamp.toString())"
                    :content="comment.content"
                />
            </div>
            <div v-else class="text-gray-500 italic">
                No comments added yet.
            </div>
            <form @submit.prevent="postComment" class="mt-4 flex gap-2">
                <input
                    v-model="newComment"
                    placeholder="Add a comment"
                    class="border border-gray-400 rounded px-2 py-1 flex-grow focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                />
                <button
                    type="submit"
                    class="bg-primary text-white px-4 py-1 rounded hover:bg-primary-dark transition"
                >
                    Send
                </button>
            </form>
        </section>
    </div>
</template>

<style scoped>
.comment-panel {
    width: 100%;
    max-width: 100%;
    max-height: 50vh;
    overflow-y: auto;
    background: white;
    padding: 1rem;
    border: 1px solid #d1d5db; /* gray-300 */
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    border-radius: 0.375rem;
}

.fade-up {
    animation: fadeUp 0.3s ease-out;
}

.fade-down {
    animation: fadeDown 0.3s ease-in;
}

@keyframes fadeUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes fadeDown {
    from {
        opacity: 1;
        transform: translateY(0);
    }
    to {
        opacity: 0;
        transform: translateY(20px);
    }
}
</style>
