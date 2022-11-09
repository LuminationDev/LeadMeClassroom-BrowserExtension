import { createApp } from 'vue'
import { createPinia } from "pinia";
import Dashboard from './Dashboard.vue'

const app = createApp(Dashboard);
const pinia = createPinia()
app.use(pinia);

app.mount('#app');
