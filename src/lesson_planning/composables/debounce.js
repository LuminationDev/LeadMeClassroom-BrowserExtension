import {onBeforeMount, ref} from "vue";

export function useDebounce() {
  const debounceTimer = ref(null)

  function debounce(method, timer) {
    console.log('running')
    if (debounceTimer.value !== null) {
      clearTimeout(debounceTimer.value)
    }
    debounceTimer.value = setTimeout(() => {
      method()
    }, timer)
  }
  onBeforeMount(() => {
    debounceTimer.value = null
  })
  return { debounce }
}