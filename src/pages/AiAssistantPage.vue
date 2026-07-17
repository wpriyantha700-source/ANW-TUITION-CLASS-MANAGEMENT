<template>
  <q-page class="q-pa-md bg-grey-1 flex flex-center">
    <div class="ai-container shadow-24 rounded-borders bg-white overflow-hidden row no-wrap">
      <!-- Sidebar / Info Panel (Hidden on mobile) -->
      <div class="gt-sm col-4 bg-black text-white q-pa-xl flex column justify-between">
        <div>
          <div class="text-h4 text-weight-bolder q-mb-md">Antigravity AI</div>
          <div class="text-subtitle1 text-grey-4 q-mb-xl">Your intelligent companion for classroom management.</div>

          <div class="q-gutter-y-md">
            <div class="row items-center q-gutter-x-sm">
              <q-icon name="auto_awesome" color="amber" size="sm" />
              <div class="text-caption">Generate lesson ideas instantly</div>
            </div>
            <div class="row items-center q-gutter-x-sm">
              <q-icon name="analytics" color="blue" size="sm" />
              <div class="text-caption">Analyze student performance</div>
            </div>
            <div class="row items-center q-gutter-x-sm">
              <q-icon name="schedule" color="green" size="sm" />
              <div class="text-caption">Optimize your class schedule</div>
            </div>
          </div>
        </div>

        <div class="text-caption text-grey-6 italic">
          Powered by Gemini Pro AI
        </div>
      </div>

      <!-- Chat Main Area -->
      <div class="col-12 col-md-8 column no-wrap">
        <!-- Chat Header -->
        <div class="q-pa-md border-bottom bg-white row items-center justify-between">
          <div class="row items-center">
            <q-avatar color="black" text-color="white" icon="smart_toy" size="md" class="q-mr-sm" />
            <div>
              <div class="text-weight-bold text-grey-9">AI Assistant</div>
              <div class="text-caption text-green">Online</div>
            </div>
          </div>
          <q-btn flat round dense icon="delete_sweep" color="grey-6" @click="clearChat" title="Clear Chat" />
        </div>

        <!-- Messages Area -->
        <q-scroll-area ref="scrollAreaRef" class="col-grow q-pa-lg">
          <div v-for="(msg, index) in messages" :key="index"
               :class="msg.role === 'user' ? 'justify-end' : 'justify-start'" class="row q-mb-lg">

            <q-avatar v-if="msg.role === 'assistant'" size="32px" color="grey-2" class="q-mr-sm q-mt-xs">
              <q-icon name="smart_toy" color="black" size="xs" />
            </q-avatar>

            <div :class="msg.role === 'user' ? 'user-bubble' : 'ai-bubble'"
                 class="q-pa-md shadow-1">
              <div class="message-content">{{ msg.content }}</div>
              <div class="text-right q-mt-xs" style="font-size: 10px; opacity: 0.6">
                {{ msg.time }}
              </div>
            </div>

            <q-avatar v-if="msg.role === 'user'" size="32px" color="black" class="q-ml-sm q-mt-xs">
              <q-icon name="person" color="white" size="xs" />
            </q-avatar>
          </div>

          <div v-if="loading" class="row justify-start q-mb-md">
            <q-avatar size="32px" color="grey-2" class="q-mr-sm q-mt-xs">
              <q-icon name="smart_toy" color="black" size="xs" />
            </q-avatar>
            <div class="ai-bubble q-pa-md shadow-1 row items-center">
              <q-spinner-dots color="black" size="sm" />
              <span class="q-ml-sm text-caption">Antigravity is thinking...</span>
            </div>
          </div>
        </q-scroll-area>

        <!-- Input Area -->
        <div class="q-pa-md border-top bg-grey-1">
          <q-input
            v-model="userInput"
            outlined
            rounded
            placeholder="Type your question here..."
            bg-color="white"
            dense
            @keyup.enter="sendMessage"
            :disable="loading"
          >
            <template v-slot:append>
              <q-btn
                round
                dense
                flat
                icon="send"
                color="primary"
                @click="sendMessage"
                :disable="!userInput.trim() || loading"
              />
            </template>
          </q-input>
          <div class="text-center text-grey-5 q-mt-xs" style="font-size: 10px">
            Press Enter to send. Use AI responsibly.
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, nextTick } from 'vue'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const scrollAreaRef = ref(null)
const userInput = ref('')
const loading = ref(false)

const getCurrentTime = () => {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const messages = ref([
  {
    role: 'assistant',
    content: 'Hello! I am Antigravity AI, your dedicated class management assistant. How can I help you today? You can ask me to draft a notice, suggest a class schedule, or help with student performance analysis.',
    time: getCurrentTime()
  }
])

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY
const genAI = new GoogleGenerativeAI(API_KEY)

const scrollToBottom = () => {
  nextTick(() => {
    if (scrollAreaRef.value) {
      const scrollTarget = scrollAreaRef.value.getScrollTarget()
      scrollAreaRef.value.setScrollPosition('vertical', scrollTarget.scrollHeight, 300)
    }
  })
}

const sendMessage = async () => {
  if (!userInput.value.trim() || loading.value) return

  const userMessage = userInput.value
  messages.value.push({
    role: 'user',
    content: userMessage,
    time: getCurrentTime()
  })
  userInput.value = ''
  loading.value = true
  scrollToBottom()

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" })
    const result = await model.generateContent(userMessage)
    const response = await result.response
    const text = response.text()

    messages.value.push({
      role: 'assistant',
      content: text,
      time: getCurrentTime()
    })
    scrollToBottom()
  } catch (error) {
    console.error('AI Error:', error)
    $q.notify({
      type: 'negative',
      message: 'Connection lost. Please check your internet or API key.',
      position: 'top'
    })
    messages.value.push({
      role: 'assistant',
      content: 'I encountered an error. Please try again in a moment.',
      time: getCurrentTime()
    })
  } finally {
    loading.value = false
  }
}

const clearChat = () => {
  $q.dialog({
    title: 'Clear Chat',
    message: 'Discard all messages in this session?',
    cancel: true,
    persistent: true
  }).onOk(() => {
    messages.value = [
      {
        role: 'assistant',
        content: 'Chat cleared. How else can I assist you?',
        time: getCurrentTime()
      }
    ]
  })
}
</script>

<style scoped>
.ai-container {
  width: 100%;
  max-width: 1000px;
  height: 85vh;
  border-radius: 24px;
}

.border-bottom { border-bottom: 1px solid rgba(0,0,0,0.05); }
.border-top { border-top: 1px solid rgba(0,0,0,0.05); }

.user-bubble {
  max-width: 80%;
  background: #000;
  color: #fff;
  border-radius: 18px 18px 0 18px;
  line-height: 1.5;
}

.ai-bubble {
  max-width: 80%;
  background: #f1f3f9;
  color: #1a1a1a;
  border-radius: 18px 18px 18px 0;
  line-height: 1.5;
}

.message-content {
  white-space: pre-wrap;
  word-break: break-word;
}

@media (max-width: 599px) {
  .ai-container {
    height: 90vh;
    border-radius: 12px;
  }
}
</style>
