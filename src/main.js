import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
// 导入全局样式表
import './assets/css/global.css'
// 导入字体图标
import './assets/fonts/iconfont.css'
import TreeTable from 'vue-table-with-tree-grid'

// 导入axios模块
import Axios from 'axios'
Axios.defaults.baseURL = 'http://127.0.0.1:9090/api/private/v1/'

// 请求拦截器
Axios.interceptors.request.use(
  config => {
    // 携带 token 令牌
    if (config.url !== 'login' && window.sessionStorage.getItem('token')) {
      config.headers.authorization = sessionStorage.getItem('token')
    }
    if (localStorage.getItem('token')) {
      config.headers.authorization = localStorage.getItem('token')
    }
    return config
  },
  error => {
    console.log('===发送请求拦截器报错===')
    console.log(error)
    console.log('===end===')
    Promise.reject(error)
  }
)
Vue.prototype.$http = Axios
Vue.config.productionTip = false
Vue.component('tree-table', TreeTable)
new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
