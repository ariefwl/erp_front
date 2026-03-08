<script setup>
import { CAlert, CBadge, CButton, CCard, CCardBody, CCardHeader, CForm, CFormFeedback, CFormFloating, CFormInput, CFormLabel, CFormSelect, CModal, CModalBody, CModalFooter, CModalHeader, CModalTitle, CSpinner, CTable, CTableBody, CTableDataCell, CTableHead, CTableHeaderCell, CTableRow } from '@coreui/vue';
import { computed, ref, watch } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { storeToRefs } from 'pinia';
import { axiosInstance } from "@/plugins/axios";
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';


pdfMake.vfs = pdfFonts

const user = ref([])
const loading = ref(false) 
const modal = ref(false)
const authStore = useAuthStore()
const { register } = authStore

const form = ref({
    name: "",
    email: "",
    password: "",
    role: ""
})

const errors = ref({
    name: "",
    email: "",
    password: "",
    role: ""
})

const valid = ref({
  name: false,
  email: false,
  role: false,
  password: false
})

watch(() => form.value.name, (v) => {
  errors.value.name = ""
  valid.value.name = v.trim().length >= 3
})

watch(() => form.value.email, (v) => {
  errors.value.email = ""
  valid.value.email = /^\S+@\S+\.\S+$/.test(v)
})

watch(() => form.value.role, (v) => {
  errors.value.role = ""
  valid.value.role = v !== "" && v !== "-- Pilih Role --"
})

watch(() => form.value.password, (v) => {
  errors.value.password = ""
  valid.value.password = v.length >= 6
})


const validateForm = () => {
    let isValid = true
    errors.value = { name: "", email: "", role: "", password: "" }

    // Name
    if (!form.value.name.trim()) {
        errors.value.name = "Username wajib diisi"
        isValid = false
    }

    // Email
    if (!form.value.email.trim()) {
        errors.value.email = "Email wajib diisi"
        isValid = false
    } else if (!/^\S+@\S+\.\S+$/.test(form.value.email)) {
        errors.value.email = "Format email tidak valid"
        isValid = false
    }

    // Role
    if (!form.value.role || form.value.role === "-- Pilih Role --") {
        errors.value.role = "Role wajib dipilih"
        isValid = false
    }

    // Password
    if (!form.value.password.trim()) {
        errors.value.password = "Password wajib diisi"
        isValid = false
    } else if (form.value.password.length < 6) {
        errors.value.password = "Password minimal 6 karakter"
        isValid = false
    }

    return isValid
}

const handleSubmit = async () => {
    if (!validateForm()) return
    await register(form.value)

    form.name = ""
    form.email = ""
    form.role = ""
    form.password = ""
    modal.value = false
    fetchUserData()
}

const badgeStatus = (status) => {
    if (status == 1) return { color: 'success', text: 'aktif'}
    return { color: 'danger', text: '0'} 
}

fetchUserData()

async function fetchUserData() {
    loading.value = true

    try {
        const resource = await axiosInstance.get('/user')
        user.value = resource.data.data
        // console.log(user.value)
    } catch (error) {
        console.error(error)
    } finally {
        loading.value = false
    }
}
</script>

<template>
    <CCard>
        <CCardHeader>
            <strong>Daftar User</strong>
        </CCardHeader>

        <CCardBody>
            <div class="d-flex mb-4">
                <CButton color="primary" class="ms-3" @click="() => { modal = true }" >
                 <b><CIcon icon="cil-user-follow" /> User </b>
                </CButton>
            </div>

            <CAlert v-if="authStore.success" color="success" class="d-flex align-items-center">
                <CIcon icon="cil-check-circle" class="flex-shrink-0 me-2" width="24" height="24" />
                <div>
                    {{ authStore.success }}
                </div>
            </CAlert>

            <div class="table-responsive text-nowrap">
                <CTable hover bordered small>
                    <CTableHead color="light" align="center">
                        <CTableRow>
                            <CTableHeaderCell>No</CTableHeaderCell>
                            <CTableHeaderCell>Username</CTableHeaderCell>
                            <CTableHeaderCell>Email</CTableHeaderCell>
                            <CTableHeaderCell>Role</CTableHeaderCell>
                            <CTableHeaderCell>Status</CTableHeaderCell>
                            <CTableHeaderCell>Action</CTableHeaderCell>
                        </CTableRow>
                    </CTableHead>

                    <CTableBody>
                        <CTableRow v-if="loading">
                            <CTableDataCell colspan="6" class="text-center">
                                <CSpinner size="sm" color="primary" /> Load data .....
                            </CTableDataCell>
                        </CTableRow>

                        <CTableRow v-else v-for="(item, index) in user" :key="index">
                            <CTableDataCell>{{ index + 1 }}</CTableDataCell>
                            <CTableDataCell>{{ item.name }}</CTableDataCell>
                            <CTableDataCell>{{ item.email }}</CTableDataCell>
                            <CTableDataCell>{{ item.role }}</CTableDataCell>
                            <CTableDataCell style="text-align: center;">
                                <CBadge :color="badgeStatus(item.status).color">
                                    {{ badgeStatus(item.status).text }}
                                </CBadge>
                            </CTableDataCell>
                            <CTableDataCell>
                                <CButton color="success" size="sm"><CIcon style="align-items: center;" icon="cil-pencil" class="flex-shrink-0 me-2" width="20" height="20"></CIcon></CButton>
                            </CTableDataCell>
                        </CTableRow>
                    </CTableBody>
                </CTable>
            </div>
        </CCardBody>
    </CCard>

        <CModal 
        backdrop="static"
        :visible="modal"
        @close="() => { modal = false }" 
        aria-labelledby="StaticBackdropExampleLabel"
        >
            <CModalHeader>
            <CModalTitle id="StaticBackdropExampleLabel">Registrasi User</CModalTitle>
            </CModalHeader>
            <CForm @submit.prevent="handleSubmit">
                <CModalBody>
                    <CFormFloating class="mb-3">
                        <CFormInput v-model="form.name" :invalid="errors.name ? true : false" type="text" id="floatingName" placeholder="Username" />
                        <CFormLabel for="floatingName">Username</CFormLabel>
                        <CFormFeedback invalid>{{ errors.name }}</CFormFeedback>
                    </CFormFloating>
                    <CFormFloating class="mb-3">
                        <CFormInput v-model="form.email" :invalid="errors.email ? true : false" type="email" id="floatingEmail" placeholder="name@example.com" />
                        <CFormLabel for="floatingEmail">Email</CFormLabel>
                        <CFormFeedback invalid>{{ errors.email }}</CFormFeedback>
                    </CFormFloating>
                    <CFormFloating>
                        <CFormSelect
                            v-model="form.role"
                            id="floatingSelect"
                            floatingLabel="Role" 
                            aria-label="Floating label select example"
                            class="mb-3"
                            :invalid="errors.role ? true : false"
                        >
                            <option>-- Pilih Role --</option>
                            <option value="admin">admin</option>
                            <option value="user">user</option>
                        </CFormSelect>
                        <CFormFeedback invalid>{{ errors.role }}</CFormFeedback>
                    </CFormFloating>
                    <CFormFloating>
                        <CFormInput v-model="form.password" :invalid="errors.password ? true : false" type="password" id="floatingPassword" placeholder="Password" />
                        <CFormLabel for="exampleFormControlPassword">Password</CFormLabel>
                        <CFormFeedback invalid>{{ errors.password }}</CFormFeedback>
                    </CFormFloating>
                </CModalBody>
                <CModalFooter>
                    <CButton color="secondary" @click="() => { modal = false }">
                        Batal
                    </CButton>
                    <CButton type="submit" color="primary">Simpan</CButton>
                </CModalFooter>
            </CForm>
        </CModal>
</template>