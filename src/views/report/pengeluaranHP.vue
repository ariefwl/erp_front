<template>
    <CCard>
        <CCardHeader>
            <strong>Pengeluaran Hasil Produksi</strong>
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
                    <CTableHead align="center" color="light">
                        <CTableRow>
                            <CTableHeaderCell>No</CTableHeaderCell>
                            <CTableHeaderCell>No. PEB</CTableHeaderCell>
                            <CTableHeaderCell>Tgl. PEB</CTableHeaderCell>
                            <CTableHeaderCell>No. BPB</CTableHeaderCell>
                            <CTableHeaderCell>Tgl. BPB</CTableHeaderCell>
                            <CTableHeaderCell>Pembeli / Penerima</CTableHeaderCell>
                            <CTableHeaderCell>Negara Tujuan</CTableHeaderCell>
                            <CTableHeaderCell>Kode Barang</CTableHeaderCell>
                            <CTableHeaderCell>Nama Barang</CTableHeaderCell>
                            <CTableHeaderCell>Satuan</CTableHeaderCell>
                            <CTableHeaderCell>Jumlah</CTableHeaderCell>
                            <CTableHeaderCell>Mata Uang</CTableHeaderCell>
                            <CTableHeaderCell>Harga Satuan</CTableHeaderCell>
                            <CTableHeaderCell>Nilai Barang</CTableHeaderCell>
                            <CTableHeaderCell>Invoice No.</CTableHeaderCell>
                        </CTableRow>                    
                    </CTableHead>

                    <CTableBody>
                        <CTableRow v-if="loading">
                            <CTableDataCell colspan="15" class="text-center">
                                <CSpinner size="sm" color="primary" /> Loading data...
                            </CTableDataCell>
                        </CTableRow>

                        <CTableRow v-else-if="sales.length === 0">
                            <CTableDataCell colspan="15" class="text-center">
                                Tidak ada data
                            </CTableDataCell>
                        </CTableRow>

                        <CTableRow v-else v-for="(item, index) in sales" :key="index"> 
                            <CTableDataCell>{{ index + 1 }}</CTableDataCell>
                            <CTableDataCell>{{ item.PEBNo }}</CTableDataCell>
                            <CTableDataCell>{{ formatDate(item.PEBDate) }}</CTableDataCell>
                            <CTableDataCell>{{ item.DONo }}</CTableDataCell>
                            <CTableDataCell>{{ formatDate(item.DODate) }}</CTableDataCell>
                            <CTableDataCell>{{ item.CustomerName }}</CTableDataCell>
                            <CTableDataCell>{{ item.Origin }}</CTableDataCell>
                            <CTableDataCell>{{ item.ItemCode }}</CTableDataCell>
                            <CTableDataCell>{{ item.InvName }}</CTableDataCell>
                            <CTableDataCell>{{ item.Unit }}</CTableDataCell>
                            <CTableDataCell class="text-end">{{ formatNumber(item.Qty) }}</CTableDataCell>
                            <CTableDataCell>{{ item.Currency }}</CTableDataCell>
                            <CTableDataCell class="text-end">{{ formatNumber(item.Up) }}</CTableDataCell>
                            <CTableDataCell class="text-end">{{ formatNumber(item.Amount) }}</CTableDataCell>
                            <CTableDataCell class="text-end"></CTableDataCell>
                        </CTableRow>
                    </CTableBody>
                </CTable>
            </div>
        </CCardBody>
    </CCard>
</template>

<script setup>
import { CButton, CCard, CCardBody, CCardHeader, CFormSelect, CSpinner, CTable, CTableBody, CTableDataCell, CTableHead, CTableHeaderCell, CTableRow } from '@coreui/vue';
import { computed, ref } from 'vue';
import { formatDate, formatNumber, monthNames, generatePeriods } from '@/helpers/format';
import CIcon from '@coreui/icons-vue';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { axiosInstance } from "@/plugins/axios";

pdfMake.vfs = pdfFonts;

const currentYear = new Date().getFullYear()
const currentMonth = new Date().getMonth() + 1 // bulan berjalan (1–12)
const startYear = 2024 // tahun mulai seperti di PHP kamu


const selectedPeriod = ref('') // format: YYYYMM
const sales = ref([])
const loading = ref(false)

const periodLabel = computed(() => {
  if (!selectedPeriod.value) return ''
  const y = selectedPeriod.value.substring(0, 4)
  const m = parseInt(selectedPeriod.value.substring(4, 6))
  return `${monthNames[m - 1]} ${y}`
})
function onChangePeriod(e) {
  selectedPeriod.value = e.target.value
  fetchSalesData()
}

const groupedPeriods = computed(() => 
  generatePeriods(startYear, currentYear, currentMonth)
)

async function exportPDF() {
    if (!selectedPeriod.value) {
        alert('Silakan pilih periode terlebih dahulu!');
        return;
    }

    const rows = sales.value.map((item, index) => [
        { text: `${index}` },
        { text: item.PEBNo},
        { text: formatDate(item.PEBDate) },
        { text: item.DONo },
        { text: formatDate(item.DODate) },
        { text: item.CustomerName },
        { text: item.Origin },
        { text: item.ItemCode },
        { text: item.InvName },
        { text: formatNumber(item.Qty), alignment: 'right' },
        { text: item.Unit },
        { text: item.Currency },
        { text: formatNumber(item.Amount), alignment: 'right' },
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
                    { text: 'LAPORAN PENGELUARAN HASIL PRODUKSI', style: 'header' },
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
                    headerRows: 2,
                    widths: ['auto','auto','auto','auto','auto','*','auto','auto','*','auto','auto','auto','auto'],
                    body: [
                        [
                            { text: 'NO', rowSpan: 2, style: 'tableHeader' },
                            { text: 'Dokumen Pabean', colSpan: 2, style: 'tableHeader' },
                            {},
                            { text: 'Bukti Pengeluaran Barang', colSpan: 2, style: 'tableHeader' },
                            {},
                            { text: 'Pembeli / Penerima', rowSpan: 2, style: 'tableHeader' },
                            { text: 'Negara Tujuan', rowSpan: 2, style: 'tableHeader' },
                            { text: 'Kode Barang', rowSpan: 2, style: 'tableHeader' },
                            { text: 'Nama Barang', rowSpan: 2, style: 'tableHeader' },
                            { text: 'Jumlah', rowSpan: 2, style: 'tableHeader' },
                            { text: 'Satuan', rowSpan: 2, style: 'tableHeader' },
                            { text: 'Mata Uang', rowSpan: 2, style: 'tableHeader' },
                            { text: 'Nilai Barang', rowSpan: 2, style: 'tableHeader' },
                        ],
                        [
                            {},
                            { text: 'NO PEB', style: 'tableHeader' },
                            { text: 'TGL PEB', style: 'tableHeader' },
                            { text: 'NO DO', style: 'tableHeader' },
                            { text: 'TGL DO', style: 'tableHeader' },
                            {},{},{},{},{},{},{},{}


                        ],
                        ...rows,
                    ],
                },
                fontSize: 8
            }
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

  pdfMake.createPdf(doc).download(`Laporan Pengeluaran Hasil Produksi_${periodLabel.value}.pdf`);
}
async function fetchSalesData() {
    loading.value = true
    try {
        const url = selectedPeriod.value
            ? `/sales/${selectedPeriod.value}`
            : `/sales`
        const res = await axiosInstance.get(url)
        sales.value = res.data.data
    } catch (error) {
        console.error('fetch error', error)
        sales.value = []
    } finally {
        loading.value = false
    }
}

// set default periode ke bulan berjalan
selectedPeriod.value = `${currentYear}${String(currentMonth).padStart(2, '0')}`
fetchSalesData()
</script>