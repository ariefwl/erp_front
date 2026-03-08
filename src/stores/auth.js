import { defineStore } from "pinia";
import { axiosInstance } from "@/plugins/axios";
import { handleError } from "@/helpers/errorHelper";
import router from "@/router";
import Cookies from "js-cookie";

export const useAuthStore = defineStore("auth", {
    state: () => ({
        user: "",
        loading: "",
        error: "",
        success: ""
    }),

    getters: {
        token: () => Cookies.get('token'),
        isAuthenticated: (state) => !!state.user
    },

    actions: {
        async login(credentials){
            this.loading = true

            try {
                const response = await axiosInstance.post('/login', credentials)
                const token = response.data.data.token
                const role = response.data.data.user.role
                Cookies.set('token', token)
                Cookies.set('role', role)
                this.success = response.data.message
                router.push({ name: 'Dashboard'})
            } catch (error) {
                // this.error = handleError(error)
                this.error = error.response?.data?.message || "Login gagal. Periksa kembali email dan password Anda."

                // Hapus flash message setelah 5 detik
                setTimeout(() => {
                    this.error = null;
                }, 5000);
            } finally {
                this.loading = false
            }
        },
        async register(credentials){
            // console.log(credentials)
              this.loading = true

              try {
                const response = await axiosInstance.post('/register', credentials)
                this.success = response.data.message

                 // Hapus flash message setelah 5 detik
                setTimeout(() => {
                    this.success = null;
                }, 5000);
              } catch (error) {
                this.error = handleError(error)
              } finally {
                this.loading = false
              }
        },
        async logout(){
            this.loading = true

            try {
                const response = await axiosInstance.post('/logout')

                Cookies.remove('token')
                this.user = null
                this.error = null
                this.success = response.data.message
                router.push({name: 'Login'})
            } catch (error) {
                this.error = handleError(error)
            } finally {
                this.loading = false
            }
        }
    }
})