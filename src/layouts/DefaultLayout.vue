<script setup>
import { CContainer, CSidebar } from '@coreui/vue'
import AppFooter from '@/components/AppFooter.vue'
import AppHeader from '@/components/AppHeader.vue'
import AppSidebar from '@/components/AppSidebar.vue'
import Cookies from 'js-cookie'

const role = Cookies.get('role')
</script>

<template>
  <div>
    <CSidebar v-if="role === 'admin'">
      <AppSidebar />
    </CSidebar>
    <div class="wrapper d-flex flex-column min-vh-100">
      <AppHeader />
      <div class="body flex-grow-1">
        <CContainer class="px-4" lg>
          <router-view />
        </CContainer>
      </div>
      <AppFooter />
    </div>
  </div>
</template>
