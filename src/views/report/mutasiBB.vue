<template>
    <CCard>
        <CCardHeader>
            <strong>Mutasi Bahan Baku</strong>
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
                            <CTableHeaderCell>Fasilitas</CTableHeaderCell>
                            <CTableHeaderCell>Kode Barang</CTableHeaderCell>
                            <CTableHeaderCell>Nama Barang</CTableHeaderCell>
                            <CTableHeaderCell>Satuan</CTableHeaderCell>
                            <CTableHeaderCell>Saldo Awal</CTableHeaderCell>
                            <CTableHeaderCell>Pemasukan</CTableHeaderCell>
                            <CTableHeaderCell>Pengeluaran</CTableHeaderCell>
                            <CTableHeaderCell>Saldo Akhir</CTableHeaderCell>
                            <CTableHeaderCell>Gudang</CTableHeaderCell>
                        </CTableRow>
                    </CTableHead>

                    <CTableBody>
                        <CTableRow v-if="loading">
                            <CTableDataCell colspan="10" class="text-center">
                                <CSpinner size="sm" color="primary" /> Loading data...
                            </CTableDataCell>
                        </CTableRow>

                        <CTableRow v-else-if="matMutt.length === 0">
                            <CTableDataCell colspan="10" class="text-center">
                                Tidak ada data
                            </CTableDataCell>
                        </CTableRow>

                        <CTableRow v-else v-for="(item, index) in matMutt" :key="index">
                            <CTableDataCell>{{ index + 1 }}</CTableDataCell>
                            <CTableDataCell>{{ item.FacilitiesName }}</CTableDataCell>
                            <CTableDataCell>{{ item.ItemCode }}</CTableDataCell>
                            <CTableDataCell>{{ item.InvName }}</CTableDataCell>
                            <CTableDataCell>{{ item.Unit }}</CTableDataCell>
                            <CTableDataCell class="text-end">{{ formatNumber(item.Begin) }}</CTableDataCell>
                            <CTableDataCell class="text-end">{{ formatNumber(item.In) }}</CTableDataCell>
                            <CTableDataCell class="text-end">{{ formatNumber(item.Out) }}</CTableDataCell>
                            <CTableDataCell class="text-end">{{ formatNumber(item.Ending) }}</CTableDataCell>
                            <CTableDataCell>{{ item.WarehouseName }}</CTableDataCell>
                        </CTableRow>
                    </CTableBody>
                </CTable>
            </div>
        </CCardBody>
    </CCard>
</template>

<script setup>
import { CCard, CCardBody, CCardHeader, CTable, CTableBody, CTableHeaderCell } from '@coreui/vue';
import { CSpinner, CTableDataCell, CTableHead, CTableRow } from '@coreui/vue'
import { formatNumber, monthNames, generatePeriods } from '@/helpers/format'
import { computed, ref } from 'vue';
import { axiosInstance } from "@/plugins/axios";
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

pdfMake.vfs = pdfFonts;

const currentYear = new Date().getFullYear()
const currentMonth = new Date().getMonth() + 1 // bulan berjalan (1–12)
const startYear = 2024 // tahun mulai seperti di PHP kamu


const selectedPeriod = ref('') // format: YYYYMM
const matMutt = ref([])
const loading = ref(false)

const periodLabel = computed(() => {
  if (!selectedPeriod.value) return ''
  const y = selectedPeriod.value.substring(0, 4)
  const m = parseInt(selectedPeriod.value.substring(4, 6))
  return `${monthNames[m - 1]} ${y}`
})

// set default periode ke bulan berjalan
selectedPeriod.value = `${currentYear}${String(currentMonth).padStart(2, '0')}`
fetchMutasiData()

function onChangePeriod(e) {
    selectedPeriod.value = e.target.value
    fetchMutasiData()
}

async function fetchMutasiData() {
    loading.value = true
    try {
        const url = selectedPeriod.value
            ? `/matmut/${selectedPeriod.value}`
            : `/matmut`
        const res = await axiosInstance.get(url)
        matMutt.value = res.data.data
        console.log(matMutt.value)
    } catch (error) {
        console.error(error)
    } finally {
        loading.value = false
    }
}

const groupedPeriods = computed(() => 
  generatePeriods(startYear, currentYear, currentMonth)
)

async function exportPDF() {
    if (!selectedPeriod.value) {
        alert('Silakan pilih periode terlebih dahulu!');
        return;
    }

    const rows = matMutt.value.map((item, index) => [
        { text: `${index + 1}` },
        { text: item.ItemCode, style: 'tableCell' },
        { text: item.InvName, style: 'tableCell' },
        { text: item.Unit, style: 'tableCell' },
        { text: formatNumber(item.Begin), style: 'tableCell', alignment: 'right' },
        { text: formatNumber(item.In), style: 'tableCell', alignment: 'right' },
        { text: formatNumber(item.Out), style: 'tableCell', alignment: 'right' },
        { text: formatNumber(item.Ending), style: 'tableCell', alignment: 'right' },
        { text: item.WarehouseName, style: 'tableCell' },
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
                    { text: 'LAPORAN MUTASI BAHAN BAKU', style: 'header' },
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

        content: [
            {
                table: {
                    headerRows: 1,
                    widths: ['auto','auto','*','auto','auto','auto','auto','auto','auto'],
                    body: [
                        [
                            { text: 'No', style: 'tableHeader' },
                            { text: 'Kode Barang', style: 'tableHeader' },
                            { text: 'Nama Barang', style: 'tableHeader' },
                            { text: 'Satuan', style: 'tableHeader' },
                            { text: 'Saldo Awal', style: 'tableHeader' },
                            { text: 'Pemasukan', style: 'tableHeader' },
                            { text: 'Pengeluaran', style: 'tableHeader' },
                            { text: 'Saldo Akhir', style: 'tableHeader' },
                            { text: 'Gudang', style: 'tableHeader' },
                        ],
                        ...rows,
                    ],
                },
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
    
    pdfMake.createPdf(doc).download(`Laporan Mutasi Bahan Baku_${periodLabel.value}.pdf`)
}

</script>