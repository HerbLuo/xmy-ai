<script setup lang="ts">
import { sendToModels } from '@/action/actions'
import { ini_ui_language } from '@/state/i18n'
import { appendQuestion, questionHistory } from '@/state/questionHistory'
import {
  currentQuestionOptions,
  toggleQuestionOptions,
} from '@/state/uiPlaygroundsCurrentQuestionOptions'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

const question = ref('')
const index = ref(-1)

const { t } = useI18n()

function handleUp() {
  index.value = index.value + 1
  const history = questionHistory.value[index.value]
  if (history) {
    question.value = history
  } else {
    index.value = index.value - 1
  }
}

function handleDown() {
  index.value = index.value - 1
  const history = questionHistory.value[index.value]
  if (history) {
    question.value = history
  } else {
    index.value = index.value + 1
  }
}

function handleEnter(event: KeyboardEvent) {
  if (event.shiftKey || event.isComposing) {
    return
  } else {
    event.preventDefault()
    if (question.value) {
      appendQuestion(question.value)
      sendToModels(question.value)
    }
    index.value = -1
    question.value = ''
  }
}
</script>

<template>
  <question-bar>
    <question-options v-if="ini_ui_language !== 'en'">
      <button
        :tooltip="
          `${currentQuestionOptions?.translate ? 'Actived' : 'Disabled'}` + t('ques-bar.auto-trans')
        "
        position="right"
        :class="{ actived: currentQuestionOptions?.translate }"
        @click="toggleQuestionOptions('translate')"
      >
        {{ t('ques-bar.automatically-translate') }}
      </button>
    </question-options>
    <textarea
      v-model="question"
      name="question-area"
      :placeholder="t('ques-bar.input')"
      @keydown.up="handleUp"
      @keydown.down="handleDown"
      @keydown.enter="handleEnter"
    />
  </question-bar>
</template>

<style lang="css" scoped>
question-bar {
  width: 100%;
  height: 52px;
  display: flex;
  background-color: white;
  border-radius: 5px;
  padding: 8px;
}

.dark question-bar {
  background-color: #3d3d3d;
  border: var(--dark-border);
}
question-options {
  height: 100%;
  display: flex;
  align-items: center;
}
button {
  width: 44px;
  height: 44px;
  line-height: 1.2em;
  border: 1px solid #bbb;
  border-radius: 6px;
  padding: 6px;
  color: #666;
}

.dark button {
  color: #aaa;
}

button:hover,
button.actived {
  color: #1890ff;
  border-color: #a7e1fd;
  background-color: #e0f5ff;
}

.dark button.actived {
  color: #aaa;
  border-color: #0009;
  background-color: #0009;
}
.dark button:hover {
  color: #aaa;
  border-color: #0005;
  background-color: #0005;
}

textarea {
  width: 100%;
  height: 100%;
  padding: 0 12px;
  border: 0;
  outline: none;
  font-size: 16px;
  color: #555;
  resize: none;
}

.dark textarea {
  color: #aaa;
  caret-color: #aaa;
  background-color: #3d3d3d;
}
</style>
