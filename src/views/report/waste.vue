<template>
    <CCard>
        <CCardHeader>
            <strong>Penyelesain Waste / Scrape</strong>
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
                            <CTableHeaderCell scope="col">No</CTableHeaderCell>
                            <CTableHeaderCell scope="col">Fasilitas</CTableHeaderCell>
                            <CTableHeaderCell scope="col">No. BC</CTableHeaderCell>
                            <CTableHeaderCell scope="col">Tanggal</CTableHeaderCell>
                            <CTableHeaderCell scope="col">Kode Barang</CTableHeaderCell>
                            <CTableHeaderCell scope="col">Nama Barang</CTableHeaderCell>
                            <CTableHeaderCell scope="col">Satuan</CTableHeaderCell>  
                            <CTableHeaderCell scope="col">Jumlah</CTableHeaderCell>  
                            <CTableHeaderCell scope="col">Harga Satuan</CTableHeaderCell>  
                            <CTableHeaderCell scope="col">Nilai Barang</CTableHeaderCell>  
                        </CTableRow>
                    </CTableHead>
                    <CTableBody>
                        <CTableRow v-if="loading">
                            <CTableDataCell colspan="10" class="text-center">
                                <CSpinner size="sm" color="primary" /> Loading data...
                            </CTableDataCell>
                        </CTableRow>

                        <CTableRow v-else-if="waste.length === 0">
                            <CTableDataCell colspan="10" class="text-center">
                                Tidak ada data
                            </CTableDataCell>
                        </CTableRow>

                        <CTableRow v-else v-for="(item, index) in waste" :key="index">
                            <CTableDataCell>{{ index + 1 }}</CTableDataCell>
                            <CTableDataCell>{{ item.FacilitiesName }}</CTableDataCell>
                            <CTableDataCell>{{ item.NoTr }}</CTableDataCell>
                            <CTableDataCell>{{ item.DateTr }}</CTableDataCell>
                            <CTableDataCell>{{ item.ItemCode }}</CTableDataCell>
                            <CTableDataCell>{{ item.InvName }}</CTableDataCell>
                            <CTableDataCell>{{ item.Unit }}</CTableDataCell>
                            <CTableDataCell class="text-end">{{ formatNumber(item.Qty) }}</CTableDataCell>
                            <CTableDataCell>{{ item.Up }}</CTableDataCell>
                            <CTableDataCell>{{ item.Amount }}</CTableDataCell>
                        </CTableRow>
                    </CTableBody>
                </CTable>
             </div>
        </CCardBody>
    </CCard>
</template>

<script setup lang="ts">
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
const waste = ref([])
const loading = ref(false)
const printing = ref(false) 

// set default periode ke bulan berjalan
selectedPeriod.value = `${currentYear}${String(currentMonth).padStart(2, '0')}`
fetchWasteData()

function onChangePeriod(e) {
    selectedPeriod.value = e.target.value
    fetchWasteData()
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

async function exportPDF() {
    if (!selectedPeriod.value) {
        alert('Silakan pilih periode terlebih dahulu!');
        return;
    }

    const rows = waste.value.map((item, index) => [
        { text: `${index + 1}`, alignment: 'center' },
        { text: '' },
        { text: formatDate(item.DateTr) },
        { text: item.ItemCode },
        { text: item.InvName },
        { text: item.Unit },
        { text: formatNumber(item.Qty), alignment: 'right' },
        { text: formatNumber(item.Up), alignment: 'right' },
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
                    { text: 'LAPORAN PENYELESAIAN WASTE', style: 'header' },
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
                    widths: ['auto','auto','auto','auto','*','auto','auto','auto','auto'],
                    body: [
                        [
                            { text: 'No', style: 'tableHeader' },
                            { text: 'No. BC', style: 'tableHeader' },
                            { text: 'Tanggal', style: 'tableHeader' },
                            { text: 'Kode Barang', style: 'tableHeader' },
                            { text: 'Nama Barang', style: 'tableHeader' },
                            { text: 'Satuan', style: 'tableHeader' },
                            { text: 'Jumlah', style: 'tableHeader' },
                            { text: 'Harga Satuan', style: 'tableHeader' },
                            { text: 'Nilai Barang', style: 'tableHeader' }
                        ],
                        ...rows
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
        }
    }

  pdfMake.createPdf(doc).download(`Laporan Penyelesaian Waste_${periodLabel.value}.pdf`);
    
}

async function fetchWasteData() {
    loading.value = true
    try {
        const url = selectedPeriod.value
            ? `/waste/${selectedPeriod.value}`
            : `/waste`
        const res = await axiosInstance.get(url)
        waste.value = res.data.data
    } catch (error) {
        console.error(error)
    } finally {
        loading.value = false
    }
}

</script>
