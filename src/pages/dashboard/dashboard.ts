import { createApp } from 'vue'
import { createPinia } from "pinia";
import Dashboard from './Dashboard.vue'
import DashboardMain from '../../components/Dashboard/ClassControl/ClassControlMain.vue'
import AccountMain from '../../components/Dashboard/Account/AccountMain.vue'
import * as VueRouter from 'vue-router'

const app = createApp(Dashboard);
app.use(createPinia());

const routes = [
    { name: 'dashboard', path: '/', component: DashboardMain },
    { name: 'account', path: '/account', component: AccountMain },
]

const router = VueRouter.createRouter({
    history: VueRouter.createWebHashHistory(),
    routes
})

app.use(router)

app.mount('#app');
