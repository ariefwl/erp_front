import { h, resolveComponent } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import DefaultLayout from '@/layouts/DefaultLayout'
import Cookies from 'js-cookie'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: DefaultLayout,
    redirect: '/dashboard',
    children: [
      {
        path: '/dashboard',
        name: 'Dashboard',
        meta: { requiresAuth: true },
        component: () =>
          import(
            '@/views/dashboard/Dashboard.vue'
          ),
      },
      {
        path: '/report',
        name: 'Report',
        component: {
          render() {
            return h(resolveComponent('router-view'))
          },
        },
        redirect: '/base/breadcrumbs',
        children: [
          {
            path: '/report/pemasukkanBB',
            name: 'PemasukkanBB',
            meta: { requiresAuth: true },
            component: () => import('@/views/report/pemasukkanBB.vue'),
          },
          {
            path: '/report/pemakaianBB',
            name: 'PemakaianBB',
            meta: { requiresAuth: true },
            component: () => import('@/views/report/pemakaianBB.vue'),
          },
          {
            path: '/report/pemasukanHP',
            name: 'PemasukanHP',
            meta: { requiresAuth: true },
            component: () => import('@/views/report/pemasukanHP.vue'),
          },
          {
            path: '/report/pengeluaranHP',
            name: 'PengeluaranHP',
            meta: { requiresAuth: true },
            component: () => import('@/views/report/pengeluaranHP.vue'),
          },
          {
            path: '/report/mutasiBB',
            name: 'MutasiBB',
            meta: { requiresAuth: true },
            component: () => import('@/views/report/mutasiBB.vue'),
          },
          {
            path: '/report/mutasiHP',
            name: 'MutasiHP',
            meta: { requiresAuth: true },
            component: () => import('@/views/report/mutasiHP.vue'),
          },
          {
            path: '/report/waste',
            name: 'Waste',
            meta: { requiresAuth: true },
            component: () => import('@/views/report/waste.vue'),
          },
        ],
      },
      {
        path: '/masterdata',
        name: 'Master Data',
        component: {
            render() {
              return h(resolveComponent('router-view'))
            },
        },
        children:[
          {
            path: '/masterdata/user',
            name: 'User',
            meta: { requiresAuth: true},
            component: () => import('@/views/masterdata/user.vue')
          }
        ]
      },
    ],
  },
  
  {
    path: '/pages',
    redirect: '/pages/404',
    name: 'Pages',
    component: {
      render() {
        return h(resolveComponent('router-view'))
      },
    },
    children: [
      {
        path: '404',
        name: 'Page404',
        component: () => import('@/views/pages/Page404'),
      },
      {
        path: '500',
        name: 'Page500',
        component: () => import('@/views/pages/Page500'),
      },
      {
        path: 'login',
        name: 'Login',
        component: () => import('@/views/pages/Login'),
      },
      {
        path: 'register',
        name: 'Register',
        component: () => import('@/views/pages/Register'),
      },
    ],
  },
  {
    path: '/auth',
    name: 'Auth',
    component: {
      render() {
        return h(resolveComponent('router-view'))
      },
    },
    children: [
      {
        path: 'login',
        name: 'Login',
        component: () => import('@/views/auth/Login'),
      }
    ]

  }
]

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior() {
    // always scroll to top
    return { top: 0 }
  },
})

router.beforeEach(async (to, from, next) => {
     const token = Cookies.get('token')

    if (to.meta.requiresAuth && !token) {
      return next({ name: 'Login' })
    }

    if (to.name === 'Login' && token) {
      return next({ name: 'Dashboard' }) // jika sudah login tapi buka login page
    }

    next()
})

export default router
