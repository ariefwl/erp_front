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

                <CButton color="success" class="ms-3" @click="exportPDF" :disabled="!selectedPeriod">
                <CIcon icon="cil-cloud-download" /> Download
                </CButton>
            </div>

            <!-- Table -->
            <div class="table-responsive text-nowrap">
                <CTable hover bordered small>
                    <CTableHead color="light" align="center">
                        <CTableRow>
                            <CTableHeaderCell>No</CTableHeaderCell>
                            <CTableHeaderCell>No. Bukti Terima</CTableHeaderCell>
                            <CTableHeaderCell>Tanggal</CTableHeaderCell>
                            <CTableHeaderCell>Kode Barang</CTableHeaderCell>
                            <CTableHeaderCell>Nama Barang</CTableHeaderCell>
                            <CTableHeaderCell>Satuan</CTableHeaderCell>
                            <CTableHeaderCell>Dari Produksi</CTableHeaderCell>
                            <CTableHeaderCell>Sub Kontrak</CTableHeaderCell>
                            <CTableHeaderCell>Dari Sub Kontrak</CTableHeaderCell>
                            <CTableHeaderCell>Gudang</CTableHeaderCell>
                        </CTableRow>
                    </CTableHead>
                    <CTableBody>
                        <CTableRow v-if="loading">
                            <CTableDataCell colSpan="11" class="text-center">
                                <CSpinner size="sm" color="primary" /> Loading data...
                            </CTableDataCell>
                        </CTableRow>

                        <CTableRow v-else-if="finGoods.length === 0">
                            <CTableDataCell colSpan="10" class="text-center">
                                Tidak ada data
                            </CTableDataCell>
                        </CTableRow>

                        <CTableRow v-else v-for="(item, index) in finGoods" :key="index">
                            <CTableDataCell>{{ index + 1 }}</CTableDataCell>
                            <CTableDataCell>{{ item.FGNo }}</CTableDataCell>
                            <CTableDataCell>{{ formatDate(item.FGDate) }}</CTableDataCell>
                            <CTableDataCell>{{ item.ItemCode }}</CTableDataCell>
                            <CTableDataCell>{{ item.InvName }}</CTableDataCell>
                            <CTableDataCell>{{ item.Unit }}</CTableDataCell>
                            <CTableDataCell class="text-end">{{ formatNumber(item.Qty) }}</CTableDataCell>
                            <CTableDataCell>{{ item.SubContract }}</CTableDataCell>
                            <CTableDataCell>{{ item.SubConQty }}</CTableDataCell>
                            <CTableDataCell>{{ item.WarehouseName }}</CTableDataCell>
                        </CTableRow>
                    </CTableBody>
                </CTable>
            </div>
        </CCardBody>
    </CCard>  
</template>

<script setup>
import { computed, ref } from 'vue'
import { CButton, CCard, CCardBody, CCardHeader, CFormSelect, CSpinner, CTable, CTableBody, CTableDataCell, CTableHead, CTableHeaderCell, CTableRow } from '@coreui/vue'
import { formatDate, formatNumber, monthNames, generatePeriods } from '@/helpers/format'
import CIcon from '@coreui/icons-vue'
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { axiosInstance } from "@/plugins/axios";


pdfMake.vfs = pdfFonts;

const currentYear = new Date().getFullYear()
const currentMonth = new Date().getMonth() + 1 // bulan berjalan (1–12)
const startYear = 2024 // tahun mulai seperti di PHP kamu


const selectedPeriod = ref('') // format: YYYYMM
const finGoods = ref([])
const loading = ref(false)

const periodLabel = computed(() => {
  if (!selectedPeriod.value) return ''
  const y = selectedPeriod.value.substring(0, 4)
  const m = parseInt(selectedPeriod.value.substring(4, 6))
  return `${monthNames[m - 1]} ${y}`
})

// set default periode ke bulan berjalan
selectedPeriod.value = `${currentYear}${String(currentMonth).padStart(2, '0')}`
fetchFGData()

function onChangePeriod(e) {
  selectedPeriod.value = e.target.value
  fetchFGData()
}

const groupedPeriods = computed(() => 
  generatePeriods(startYear, currentYear, currentMonth)
)

async function fetchFGData() {
    loading.value = true
    try {
        const url = selectedPeriod.value
            ? `/fingoods/${selectedPeriod.value}`
            : `/fingoods`
        const res = await axiosInstance.get(url)
        finGoods.value = res.data.data
    } catch (error) {
        console.error('fetch error', error)
        finGoods.value = []
    } finally {
        loading.value = false
    }
}

async function exportPDF() {
    if (!selectedPeriod.value) {
        alert('Silakan pilih periode terlebih dahulu!');
        return;
    }

    const rows = finGoods.value.map((item,index) => [
        { text: `${index + 1}` },
        { text: item.FGNo },
        { text: formatDate(item.FGDate) },
        { text: item.ItemCode },
        { text: item.InvName },
        { text: item.Unit },
        { text: formatNumber(item.Qty), alignment: 'right' },
        { text: formatNumber(item.SubConQty),alignment: 'right' },
        { text: item.WarehouseName }
    ])

    const doc = {
        pageSize: 'A4',
        pageOrientation: 'landscape',
        pageMargins: [40, 60, 40, 40],

        // HEADER PDF
        header: function () {
            return {
                margin: [20, 15],
                stack: [
                    { text: 'LAPORAN PEMASUKAN HASIL PRODUKSI', style: 'header' },
                    { text: `Periode: ${periodLabel.value}`, style: 'subheader' },
                ],
            }
        },

        footer: function (current, total) {
            return {
                margin: [20, 10],
                columns: [
                    { text: 'Dicetak: ' + new Date().toLocaleDateString('id-ID'), alignment: 'left' },
                    { text: `Halaman ${current} dari ${total}`, alignment: 'right' },
                ],
                fontSize: 8
            }
        },

        // CONTENT PDF
        content: [
            {
                table: {
                    headerRows: 2,
                    widths: ['auto', 'auto', 'auto', 'auto', '*', 'auto', 'auto', 'auto', 'auto'],
                    body: [
                        [
                            { text: 'No', rowSpan: 2, style: 'tableHeader' },
                            { text: 'Bukti Pengiriman', colSpan: 2, style: 'tableHeader' }, 
                            {},
                            { text: 'Kode', rowSpan: 2, style: 'tableHeader' },
                            { text: 'Nama', rowSpan: 2, style: 'tableHeader' },
                            { text: 'Satuan', rowSpan: 2, style: 'tableHeader' },
                            { text: 'Jumlah', colSpan: 2, style: 'tableHeader' },
                            {},    
                            { text: 'Gudang', rowSpan: 2, style: 'tableHeader' },
                        ],
                        [
                            {},
                            { text: 'Nomor', style: 'tableHeader' },
                            { text: 'Tanggal', style: 'tableHeader' },
                            {},{},{},
                            { text: 'dari Produksi', style: 'tableHeader' },
                            { text: 'dari SubKontraktor', style: 'tableHeader' },
                            {}
                        ],    
                        ...rows,
                    ],
                },
                layout: 'HorizontalLines',
                fontSize: 8
            },
        ],
        styles: {
            header: { fontSize: 14, bold: true, alignment: 'center' },
            subheader: { fontSize: 11, bold: true, alignment: 'center' },
            tableHeader: {
                bold: true,
                fontSize: 8,
                fillColor: "#eeeeee",
                color: "black",
                alignment: "center"
            },
        },
    }

    pdfMake.createPdf(doc).download(`Laporan Pemasukkan Hasil Produksi_${periodLabel.value}.pdf`);
}
</script>