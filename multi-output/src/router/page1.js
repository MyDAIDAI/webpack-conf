import Vue from 'vue'
import Router from 'vue-router'
import Page1Component from '@/components/Page1Component'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Page1Component',
      component: Page1Component
    }
  ]
})
