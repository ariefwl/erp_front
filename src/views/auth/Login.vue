<script setup>
    import { useAuthStore } from '@/stores/auth';
    import { CButton, CCard, CCardBody, CContainer, CForm, CFormInput, CImage, CInputGroup, CInputGroupText, CRow } from '@coreui/vue';
    import { storeToRefs } from 'pinia';
    import { ref } from 'vue';
    import logo from "@/assets/logo/Logo1.png";
    import CIcon from '@coreui/icons-vue';

    const authStore = useAuthStore()
    const { loading, error} = storeToRefs(authStore)
    const { login } = authStore

    const form = ref({
        name: null,
        password: null
    })

    const handleSubmit = async () => {
        await login(form.value)
    }

</script>

<template>
  <div class="wrapper min-vh-100 d-flex flex-row align-items-center">
    <CContainer>
      <CRow class="justify-content-center">
        <!-- <CCol :md="6">
          <CCardGroup> -->
            <CCard style="width: 350px;">
              <CImage :src="logo"/>
              <CCardBody>
                <CForm @submit.prevent="handleSubmit">
                  <!-- <h1>Login</h1> -->
                  <h5 class="text-center fw-bold mb-6">IT. Inventory Management System</h5>

                  <div v-if="authStore.error" class="alert alert-danger alert-dismissible fade show" role="alert">
                    {{ authStore.error }}
                    <!-- <button type="button" class="btn-close" data-bs-dismiss="alert"></button> -->
                  </div>

                  <!-- <p class="text-body-secondary">Sign In to your account</p> -->
                  <CInputGroup class="mb-3 mt-4">
                    <CInputGroupText>
                      <CIcon icon="cil-user" />
                    </CInputGroupText>
                    <CFormInput
                      v-model="form.name"
                      placeholder="Username"
                      autocomplete="username"
                    />
                  </CInputGroup>
                  <CInputGroup class="mb-4">
                    <CInputGroupText>
                      <CIcon icon="cil-lock-locked" />
                    </CInputGroupText>
                    <CFormInput
                      v-model="form.password"
                      type="password"
                      placeholder="Password"
                      autocomplete="current-password"
                    />
                  </CInputGroup>
                  <CRow>
                    <!-- <CCol :xs="6"> -->
                      <CButton type="submit" color="primary"> 
                          <span v-if="!loading"><b>Login</b></span>
                          <span v-else><b>Loading .....</b></span>  
                      </CButton>
                    <!-- </CCol> -->
                    <!-- <CCol :xs="6" class="text-right">
                      <CButton color="link" class="px-0">
                        Forgot password?
                      </CButton>
                    </CCol> -->
                  </CRow>
                </CForm>
              </CCardBody>
            </CCard>
            <!-- <CCard class="text-white bg-primary py-5" style="width: 44%">
              <CCardBody class="text-center">
                <div>
                  <h2>Sign up</h2>
                  <p>
                    Lorem ipsum dolor sit amet, consectetur adipisicing elit,
                    sed do eiusmod tempor incididunt ut labore et dolore magna
                    aliqua.
                  </p>
                  <CButton color="light" variant="outline" class="mt-3">
                    Register Now!
                  </CButton>
                </div>
              </CCardBody>
            </CCard> -->
          <!-- </CCardGroup>
        </CCol> -->
      </CRow>
    </CContainer>
  </div>
</template>
