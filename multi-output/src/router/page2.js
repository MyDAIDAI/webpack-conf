import Vue from 'vue'
import Router from 'vue-router'
import Page2Component from '@/components/Page2Component'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Page2Component',
      component: Page2Component
    }
  ]
})
