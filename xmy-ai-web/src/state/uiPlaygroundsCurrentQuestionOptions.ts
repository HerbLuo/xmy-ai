import { computed } from 'vue'
import { changeCurrentPlayground, currentPlayground } from './uiPlaygroundsCurrentPlayground'
import type { QuestionOptions } from './uiPlaygrounds'

export const currentQuestionOptions = computed(() => currentPlayground.value?.questionOptions)

export function toggleQuestionOptions(key: keyof QuestionOptions) {
  changeCurrentPlayground((playground) => {
    const qo = playground.questionOptions
    qo[key] = !qo[key]
  })
}
