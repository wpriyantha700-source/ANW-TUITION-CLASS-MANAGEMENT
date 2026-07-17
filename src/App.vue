<template>
  <router-view />
</template>

<script setup>
import { onMounted } from 'vue'
import { useUserStore } from 'src/stores/userStore'

const userStore = useUserStore()

onMounted(() => {
  userStore.fetchSession()
})
</script>
