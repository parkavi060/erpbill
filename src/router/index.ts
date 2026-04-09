import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: () => import('../layouts/DashboardLayout.vue'),
      children: [
        {
          path: '',
          name: 'dashboard',
          component: () => import('../views/DashboardPage.vue')
        },
        {
          path: 'invoices',
          name: 'invoices',
          component: () => import('../views/InvoicesPage.vue')
        },
        {
          path: 'clients',
          name: 'clients',
          component: () => import('../views/ClientsPage.vue')
        },
        {
          path: 'products',
          name: 'products',
          component: () => import('../views/ProductsPage.vue')
        },
        {
          path: 'invoices/builder',
          name: 'invoice-builder',
          component: () => import('../views/InvoiceBuilderPage.vue')
        }
      ]
    }
  ]
})

export default router
