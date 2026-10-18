<template>
    <CCard>
        <CCardHeader>
            <strong>Pemasukan Hasil Produksi</strong>
        </CCardHeader>
        <CCardBody>

            <!-- Filter Periode -->
            <div class="d-flex align-items-center mb-3">
                <label class="me-2 fw-semibold ms-3">Periode:</label>

                <CFormSelect :value="selectedPeriod" @change="onChangePeriod" class="w-auto">
                    <option value="">-- Pilih Periode --</option>

                    <!-- Group per tahun -->
                    <optgroup v-for="(months, year) in groupedPeriods" :key="year" :label="year">
                        <option v-for="p in months" :key="p.value" :value="p.value">
                        {{ p.label }}
                        </option>
                    </optgroup>
                </CFormSelect>
            </div>

            <vue3-datatable :rows="rows" :columns="columns" :loading="loading" :totalRows="total_rows" :isServerMode="true" :pageSize="params.pagesize" @change="changeServer"> 
                <template #FGDate="data">
                    {{ formatDatee(data.value.FGDate) }}
                </template>
            </vue3-datatable>

        </CCardBody>
    </CCard>  
</template>
<style>
    .nowrap {
        white-space: nowrap;
    }
    .right {
        text-align: right !important;
    }
</style>

<script setup lang="ts">
    import { CButton, CCard, CCardBody, CCardHeader, CFormSelect, CSpinner, CTable, CTableBody, CTableDataCell, CTableHead, CTableHeaderCell, CTableRow } from '@coreui/vue'
    import { formatDate, formatNumber, monthNames, generatePeriods, formatDatee, generateColumns } from '@/helpers/format'
    import CIcon from '@coreui/icons-vue'
    import { computed, ref, toRaw, onMounted, reactive } from 'vue'
    import { axiosInstance } from "@/plugins/axios"

    import Vue3Datatable from '@bhplugin/vue3-datatable';
    import '@bhplugin/vue3-datatable/dist/style.css'

    onMounted(() => {
        fetchFGData();
    });

    const selectedPeriod = ref('') // format: YYYYMM
    const currentYear = new Date().getFullYear()
    const currentMonth = new Date().getMonth() + 1 // bulan berjalan (1–12)
    const startYear = 2025 // tahun mulai

    const periodLabel = computed(() => {
        if (!selectedPeriod.value) return ''
        const y = selectedPeriod.value.substring(0, 4)
        const m = parseInt(selectedPeriod.value.substring(4, 6))
        return `${monthNames[m - 1]} ${y}`
    })

    const params = reactive({ current_page: 1, pagesize: 10, period: selectedPeriod.value });

    // set default periode ke bulan berjalan
    selectedPeriod.value = `${currentYear}${String(currentMonth).padStart(2, '0')}`
    params.period = selectedPeriod.value

    function onChangePeriod(e) {
        selectedPeriod.value = e.target.value
        params.period = selectedPeriod.value   // update param API
        params.current_page = 1                // reset ke page 1
        fetchFGData()
    }

    const groupedPeriods = computed(() => 
        generatePeriods(startYear, currentYear, currentMonth)
    )
    const loading: any = ref(true)
    const total_rows = ref(0);
    const rows: any = ref(null);

    const columns = generateColumns([
            { field: 'no', title: 'No.', type: "rownum" },
            { field: 'FGNo', title: 'No. Bukti Terima' },
            { field: 'FGDate', title: 'Tanggal', type: 'date', cellClass: "nowrap" },
            { field: 'ItemCode', title: 'Kode Barang' },
            { field: 'InvName', title: 'Nama Barang', cellClass: "nowrap" },
            { field: 'Unit', title: 'Satuan', cellClass: "right" },
            { field: 'Qty', title: 'Dari Produksi', type: 'number', cellClass: "right" },
            { field: 'SubContract', title: 'Sub Kontrak' },
            { field: 'SubConQty', title: 'Dari Sub Kontrak' },
            { field: 'WarehouseName', title: 'Gudang', cellClass: "nowrap" },
        ]) || [];

    const fetchFGData = async () => {
        try {
            loading.value = true;

            const response = await axiosInstance.get('/fingoods', {
                params
            });

            const data = response.data;

            //rows.value = data?.data;
            rows.value = data?.data.map((row, i) => ({
                ...row,
                no: (params.current_page - 1) * params.pagesize + i + 1
            }))
            total_rows.value = data?.meta?.total;
        } catch (err) {
          console.error(err)
        }

        loading.value = false;
    };

    const changeServer = (data: any) => {
        params.current_page = data.current_page;
        params.pagesize = data.pagesize;

        fetchFGData();
    };
</script>