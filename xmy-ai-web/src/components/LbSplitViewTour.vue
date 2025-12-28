<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import CpModal from './CpModal.vue'
const show = ref(false)
const emit = defineEmits(['hidden'])
onMounted(() => {
  show.value = true
})
function toggleFullscreen(e: PointerEvent) {
  const elem: HTMLImageElement | null = e.target as unknown as HTMLImageElement

  if (!document.fullscreenElement) {
    if (elem?.requestFullscreen) {
      elem.requestFullscreen()
    }
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen()
    }
  }
}
</script>

<template>
  <CpModal v-model:show="show" title="拆分视图模式说明" @update:show="emit('hidden')">
    <div>
      <ol>
        <li>
          在小绵羊AI助手右上方选择一个AI在拆分视图中启用（例如：Copilot），如下图
          <img src="../imgs/s_tour_1.png" @click="toggleFullscreen" />
        </li>
        <li>在新的标签页打开目标AI(建议点击Copilot对应的超链接打开，防止网址不匹配)</li>
        <li>
          在小绵羊AI助手所在标签页右键，选择向新的拆分视图中添加标签页，如下图
          <img src="../imgs/s_tour_2.jpg" @click="toggleFullscreen" />
        </li>
        <li>
          选择目标AI所在界面
          <img src="../imgs/s_tour_3.jpg" @click="toggleFullscreen" />
        </li>
        <li>
          之后，我们可以借助Chrome原生的功能随意调整拆分视图的宽度
          <img src="../imgs/s_tour_4.jpg" @click="toggleFullscreen" />
        </li>
        <li>
          在小绵羊AI助手中提问，会自动向拆分视图中的AI发起提问
          <br />
          <br />
          <br />
          <br />
        </li>
      </ol>
    </div>
  </CpModal>
</template>

<style lang="css" scoped>
div {
  height: 100%;
  overflow-y: scroll;
}
ol {
  width: 380px;
  padding: 16px 8px 0 36px;
  margin-bottom: 16px;
}
img {
  width: 100%;
  padding: 8px 18px 8px 0;
}
</style>
