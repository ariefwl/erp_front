<template>
    <CCard>
        <CCardHeader>
            <strong>Pemasukan Bahan Baku</strong>
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

                <CButton color="primary" class="ms-3" @click="exportPDF" :disabled="!selectedPeriod">
                <CIcon icon="cil-cloud-download" /> Download
                </CButton>
            </div>

            <!-- Table -->
            <DataTable ref="tableRef" :columns="columns" :options="options" class="display nowrap" width="100%"></DataTable>
        </CCardBody>
    </CCard>
</template>

<style>
  @import 'datatables.net-dt';
  @import 'datatables.net-responsive-dt';
  @import 'datatables.net-select-dt';
</style>

<script setup lang="ts">
    import { ref, computed, watch } from 'vue';
    import { generatePeriods, monthNames, formatDate, formatNumber } from '@/helpers/format.js';
    import pdfMake from 'pdfmake/build/pdfmake';
    import pdfFonts from 'pdfmake/build/vfs_fonts';
    import { axiosInstance } from "@/plugins/axios";
    import DataTable from "datatables.net-vue3";
    import DataTablesCore from "datatables.net";

    import 'datatables.net-responsive';
    import 'datatables.net-select';
    import { data } from 'autoprefixer';
    import { CCard, CCardHeader } from '@coreui/vue';

    DataTable.use(DataTablesCore)

    pdfMake.vfs = pdfFonts;

    const currentYear = new Date().getFullYear()
    const currentMonth = new Date().getMonth() + 1 // bulan berjalan (1–12)
    const startYear = 2026 // tahun mulai

    const selectedPeriod = ref('') // format: YYYYMM
    const purchases = ref([])
    const loading = ref(false)

    const periodLabel = computed(() => {
        if (!selectedPeriod.value) return ''
        const y = selectedPeriod.value.substring(0, 4)
        const m = parseInt(selectedPeriod.value.substring(4, 6))
        return `${monthNames[m - 1]} ${y}`
    })

    const groupedPeriods = computed(() => 
        generatePeriods(startYear, currentYear, currentMonth)
    )


    // set default periode ke bulan berjalan
    selectedPeriod.value = `${currentYear}${String(currentMonth).padStart(2, '0')}`

    const tableRef = ref(null)

    function onChangePeriod(e) {
        selectedPeriod.value = e.target.value
    }

    watch(selectedPeriod, () => {
        if (tableRef.value) {
            tableRef.value.dt.ajax.reload(null, true)
        }
    })

    const columns = [
        {
            data: null,
            title: "No",
            orderable: false,
            searchable: false,
            render: function (_data: any, _type: any, _row: any, meta: any) {
                return meta.row + meta.settings._iDisplayStart + 1
            }
        },
        { data: "DocType",title: "Jenis Dok." },
        { data: "PIBNo",title: "No. PIB" },
        {
            data: "PIBDate",
            title: "Tgl. PIB",
            render: function (data: any) { return formatDate(data) }
        },
        { data: "SerialNo",title: "No. Seri" },
        { data: "GRNo",title: "No. BTB" },
        {
            data: "GRDate",
            title: "Tgl. BTB",
            render: function (data: any) { return formatDate(data) }
        },
        { data: 'Supplier Name', title: 'Supplier', defaultContent: '-' },
        { data: 'PartNo', title: 'Kode Barang'},
        { data: 'InvName', title: 'Nama Barang'},
        { data: 'Qty', title: 'Qty'},
        { data: 'Unit', title: 'Satuan'},
        { data: 'Currency', title: 'Mata Uang'},
        { data: 'Amount', title: 'Nilai Barang'},
        { data: 'Up', title: 'Harga Satuan'},
        { data: 'Rate', title: 'Rate'},
        { data: 'ConUp', title: 'Harga Satuan Konversi'},
        { data: 'ConAmount', title: 'Nilai Barang Konversi'}
    ]

    const options = {
        processing: true,
        serverSide: true,
        responsive: true,
        select: true,

        ajax: async (data, callback) => {
            try {
                const res = await axiosInstance.get(`/purchase-kb`, {
                    params: {
                        period: selectedPeriod.value,
                        draw:   data.draw,
                        start:  data.start,
                        length: data.length,
                        search: data.search.value,
                        'order[0][column]': data.order?.[0]?.column ?? 0,
                        'order[0][dir]':    data.order?.[0]?.dir ?? 'asc',
                    }
                })
                callback(res.data)
            } catch (err) {
                console.error('fetch error:', err)
                callback({ draw: data.draw, recordsTotal: 0, recordsFiltered: 0, data: [] })
            }
        }
    }

</script>