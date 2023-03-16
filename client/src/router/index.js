import Vue from 'vue'
import Router from 'vue-router'
import Layout from "@Components/manager";

Vue.use(Router)


export const menuRoutes =
  {
    path: '/manager',
    redirect: '/dashboard',
    component: Layout,
    children: [
      // {
      //   path: '/dashboard',
      //   component: () => import('../components/appDetail/appDetail.vue'),
      //   name: 'dashboard',
      //   meta: { title: '数据概览', icon: 'icon-ic_about_s'},
      // }
      // ,
      {
        path: '/distribute',
        component: () => import('../components/appDetail/appDetail.vue'),
        name: 'distribute',
        meta: { title: '发布应用', icon: 'icon-ic_overview_s' },
      },{
        path: '/team',
        component: () => import('../components/team/teamMgr.vue'),
        name: 'team',
        meta: { title: '团队管理', icon: 'icon-ic_team' },
      },{
        path: '/appSetting',
        component: () => import('../components/appDetail/appSetting.vue'),
        name: 'appSetting',
        meta: { title: '应用设置', icon: 'icon-ic_setting' },
      }
    ]
  }

export default new Router({
  // 去除#
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'Home',
      component: () => import('../components/home/home.vue')
    },
    {
      path: '/app',
      name: 'AppDetail',
      component: () => import('../components/appDetail/appDetail.vue')
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('../components/auth/auth.vue')
    },
    {
      path: '/user',
      name: 'UserInfo',
      component: () => import('../components/user/userInfo.vue')
    },
    menuRoutes,
    {
      path: '/:id',
      name: 'AppPreView',
      component: () => import('../components/appDetail/appPreView.vue')
    },

  ]
})

