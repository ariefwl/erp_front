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

                <label class="me-2 fw-semibold ms-3">Gudang:</label>
                <CFormSelect v-model="selectedWare" class="w-auto" @change="onChangeWare">
                    <option value="">-- Semua Gudang --</option>
                    <option v-for="ware in warehouses" :key="ware.WareId" :value="String(ware.WareId)">{{ ware.WarehouseName }}</option>
                </CFormSelect>
            </div>

            <!-- Table -->
            <div class="table-wrapper">
                <DataTable ref="tableRef" :columns="columns" :options="options" class="display nowrap" width="100%"></DataTable>
            </div>
        </CCardBody>
    </CCard>
</template>

<style>
  @import 'datatables.net-dt';
  @import 'datatables.net-select-dt';
  @import '@/styles/datatable-scroll.css';
</style>

<style>
</style>

<script setup lang="ts">
    import { ref, computed, watch, onMounted, nextTick } from 'vue';
    import { generatePeriods, monthNames, formatDate, formatNumber } from '@/helpers/format.js';
    import pdfMake from 'pdfmake/build/pdfmake';
    import pdfFonts from 'pdfmake/build/vfs_fonts';
    import { axiosInstance } from "@/plugins/axios";
    import DataTable from "datatables.net-vue3";
    import DataTablesCore from "datatables.net";

    import 'datatables.net-select';
    import { data } from 'autoprefixer';
    import { CButton, CCard, CCardHeader, CFormSelect } from '@coreui/vue';
    import CIcon from '@coreui/icons-vue';

    DataTable.use(DataTablesCore)

    pdfMake.vfs = pdfFonts;

    const currentYear = new Date().getFullYear()
    const currentMonth = new Date().getMonth() + 1 // bulan berjalan (1–12)
    const startYear = 2026 // tahun mulai

    const selectedPeriod = ref('') // format: YYYYMM
    const purchases = ref([])
    const loading = ref(false)

    const warehouses = ref([])
    const selectedWare = ref('')

    const getWarehouses = async () => {
        try {
            const response = await axiosInstance.get('/warehouse-kb')
            warehouses.value = response.data.data
        } catch (error){
            console.error('Gagal Mengabil Data Gudang', error)
        }
    }

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
        { data: "GRNo",title: "No. BTB" },
        {
            data: "GRDate",
            title: "Tgl. BTB",
            render: function (data: any) { return formatDate(data) }
        },
        { data: 'Supplier Name', title: 'Supplier', defaultContent: '-' },
        { data: 'PartNo', title: 'Kode Barang'},
        { data: 'InvName', title: 'Nama Barang'},
        { data: 'Qty', title: 'Qty', render: function (data: any) { return formatNumber(data) }},
        { data: 'Unit', title: 'Satuan'},
        { data: 'Currency', title: 'Mata Uang'},
        { data: 'Amount', title: 'Nilai Barang', className: 'text-end',render: function (data: any) { return formatNumber(data) }},
        { data: 'Up', title: 'Harga Satuan', className: 'text-end',render: function (data: any) { return formatNumber(data) }},
        { data: 'Rate', title: 'Rate', className: 'text-end',render: function (data: any) { return formatNumber(data) }},
        { data: 'ConUp', title: 'Harga Satuan Konversi', className: 'text-end',render: function (data: any) { return formatNumber(data) }},
        { data: 'ConAmount', title: 'Nilai Barang Konversi', className: 'text-end',render: function (data: any) { return formatNumber(data) }},
        { data: 'InvNo', title: 'InvNo'},
        { data: 'TaxNo', title: 'NPWP'},
        { data: 'Warehouse Name', title:'Gudang', defaultContent: '-'}
    ]

    const options = {
        processing: true,
        serverSide: true,
        scrollX: true,
        select: true,

        ajax: async (data, callback) => {
            try {
                const res = await axiosInstance.get(`/purchase-kb`, {
                    params: {
                        period: selectedPeriod.value,
                        wareId: selectedWare.value,

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

    // Cetak PDF
    async function exportPDF() {
        if (!selectedPeriod.value) {
            alert('Silakan pilih periode terlebih dahulu!');
            return;
        }

        // Fetch semua data tanpa paginasi (purchases.value tidak diisi oleh DataTable serverSide)
        let allData = []
        try {
            const res = await axiosInstance.get('/purchase-kb', {
                params: {
                    period: selectedPeriod.value,
                    wareId: selectedWare.value,
                    draw: 1,
                    start: 0,
                    length: -1,   // ambil semua data
                    search: '',
                    'order[0][column]': 3,
                    'order[0][dir]': 'asc',
                }
            })
            allData = res.data.data ?? []
        } catch (err) {
            console.error('Gagal mengambil data untuk PDF:', err)
            alert('Gagal mengambil data. Silakan coba lagi.')
            return
        }

        const rows = allData.map((item: any, index: number) => [
            { text: `${index + 1}` },
            { text: item.DocType ?? '-' },
            { text: item.PIBNo ?? '-' },
            { text: formatDate(item.PIBDate) },
            { text: item.GRNo ?? '-' },
            { text: formatDate(item.GRDate) },
            { text: item.PartNo ?? '-' },
            { text: item.InvName ?? '-' },
            { text: item.Unit ?? '-' },
            { text: formatNumber(item.Qty) },
            { text: item.Currency ?? '-' },
            { text: formatNumber(item.Amount) },
            { text: item['Warehouse Name'] ?? '-' },
        ])

        const doc: any = {
            pageSize: 'A4',
            pageOrientation: 'landscape',
            pageMargins: [40, 70, 40, 40],

            header: function () {
                return {
                    margin: [20, 15],
                    stack: [
                        { text: 'PT. JANSEN INDONESIA', style: 'header'},
                        { text: 'Laporan Pemasukan Bahan Baku', style: 'header'},
                        { text: `Periode : ${periodLabel.value}`, style: 'subheader'},
                    ],
                }
            },

            footer: function(currentPage, pageCount) {
                return {
                    margin: [20, 10],
                    columns: [
                        { text: `Dicetak : ` + new Date().toLocaleDateString('id-ID'), alignment: 'left'},
                        { text: `Halaman ${currentPage} dari ${pageCount}`, alignment: 'right'},
                    ],
                    fontSize: 8
                }
            },

            content: [
                {
                    table: {
                        headerRows: 3,
                        widths: ['auto','auto','auto','auto','auto','auto','auto','auto','auto','auto','auto','auto','auto'],
                        body: [
                            [
                                { text: 'No', style: 'tableHeader'},
                                { text: 'Jenis Dokumen', style: 'tableHeader'},
                                { text: 'No. PIB', style: 'tableHeader'},
                                { text: 'Tgl. PIB', style: 'tableHeader'},
                                { text: 'No. BTB', style: 'tableHeader'},
                                { text: 'Tgl. BTB', style: 'tableHeader'},
                                { text: 'Kode Barang', style: 'tableHeader'},
                                { text: 'Nama Barang', style: 'tableHeader'},
                                { text: 'Unit', style: 'tableHeader'},
                                { text: 'Qty', style: 'tableHeader'},
                                { text: 'Mata Uang', style: 'tableHeader'},
                                { text: 'Nilai Barang', style: 'tableHeader'},
                                { text: 'Gudang', style: 'tableHeader'}
                            ],
                            ...rows,
                        ],
                    },
                    layout: {
                        fillColor: function (rowIndex, node, columnIndex) {
                        // warna header
                        return (rowIndex === 0 || rowIndex === 1) ? '#eeeeee' : null
                        }
                    },
                    fontSize: 8
                },
            ],
            styles: {
                header: { fontSize: 14, bold: true, alignment: "center" },
                subheader: { fontSize: 11, alignment: "center", margin: [0, 2] },
                tableHeader: {
                    bold: true,
                    fontSize: 8,
                    fillColor: "#eeeeee",
                    color: "black",
                    alignment: "center"
                }
            }
        };

        pdfMake.createPdf(doc as any).download(`Pemasukan Bahan Baku_${periodLabel.value}.pdf`);
    }

    onMounted(() => {
        getWarehouses()
    })

    const onChangeWare = async () => {
        await nextTick()
        tableRef.value?.dt?.ajax.reload()
    }

</script>