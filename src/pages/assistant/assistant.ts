import { createApp } from 'vue'
import { createPinia } from "pinia";
import Assistant from './Assistant.vue'

const app = createApp(Assistant);
app.use(createPinia());

app.mount('#app');
