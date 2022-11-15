import { createApp } from 'vue'
import { createPinia } from "pinia";
import Dashboard from './Dashboard.vue'

const app = createApp(Dashboard);
app.use(createPinia());

app.mount('#app');
