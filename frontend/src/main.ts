import { createApp } from 'vue'
import 'amfe-flexible'
// showToast / showConfirmDialog 是函数式调用，需单独引入对应样式
import 'vant/es/toast/style'
import 'vant/es/dialog/style'
import App from './App.vue'
import router from './router'

createApp(App).use(router).mount('#app')
