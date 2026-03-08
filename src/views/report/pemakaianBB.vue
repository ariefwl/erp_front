<template>
  <CCard>
    <CCardHeader>
      <strong>Pemakaian Bahan Baku</strong>
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
      <div class="table-responsive text-nowrap">
              <CTable hover bordered small>
                  <CTableHead align="center" color="light">
                      <CTableRow>
                          <CTableHeaderCell>No</CTableHeaderCell>
                          <CTableHeaderCell>No. Transaksi</CTableHeaderCell>
                          <CTableHeaderCell>Tanggal</CTableHeaderCell>
                          <CTableHeaderCell>Kode Barang</CTableHeaderCell>
                          <CTableHeaderCell>Nama Barang</CTableHeaderCell>
                          <CTableHeaderCell>Satuan</CTableHeaderCell>
                          <CTableHeaderCell>Jumlah Digunakan</CTableHeaderCell>
                          <CTableHeaderCell>Jumlah di SubKontrakan</CTableHeaderCell>
                          <CTableHeaderCell>Nama SubKontrak</CTableHeaderCell>
                          <CTableHeaderCell>Fasilitas</CTableHeaderCell>
                          <CTableHeaderCell>Waste Qty</CTableHeaderCell>
                      </CTableRow>
                  </CTableHead>

                  <CTableBody>
                      <CTableRow v-if="loading">
                          <CTableDataCell colspan="11" class="text-center">
                              <CSpinner size="sm" color="primary" /> Loading data...
                          </CTableDataCell>
                      </CTableRow>

                      <CTableRow v-else-if="matUses.length === 0">
                          <CTableDataCell colspan="11" class="text-center">
                              Tidak ada data  
                          </CTableDataCell>
                      </CTableRow>

                      <CTableRow v-else v-for="(item, index) in matUses" :key="index">
                          <CTableDataCell>{{ index + 1 }}</CTableDataCell>
                          <CTableDataCell>{{ item.MUNo }}</CTableDataCell>
                          <CTableDataCell>{{ formatDate(item.MUDate) }}</CTableDataCell>
                          <CTableDataCell>{{ item.ItemCode }}</CTableDataCell>
                          <CTableDataCell>{{ item.InvName }}</CTableDataCell>
                          <CTableDataCell>{{ item.Unit }}</CTableDataCell>
                          <CTableDataCell class="text-end">{{ formatNumber(item.Qty) }}</CTableDataCell>
                          <CTableDataCell class="text-end">{{ formatNumber(item.SubConQty) }}</CTableDataCell>
                          <CTableDataCell>{{ item.SubContract }}</CTableDataCell>
                          <CTableDataCell>{{ item.FacilitiesName }}</CTableDataCell>
                          <CTableDataCell class="text-end">{{ formatNumber(item.WasteQty) }}</CTableDataCell>
                      </CTableRow>
                  </CTableBody>
              </CTable>
          </div>
    </CCardBody>
  </CCard>
</template>

<script setup>
import { ref, computed } from 'vue'
import { generatePeriods, monthNames, formatDate, formatNumber } from '@/helpers/format.js';
import { CButton, CCard, CCardBody, CCardHeader, CFormSelect, CSpinner, CTable, CTableBody, CTableDataCell, CTableHead, CTableHeaderCell, CTableRow } from '@coreui/vue';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { axiosInstance } from "@/plugins/axios";


pdfMake.vfs = pdfFonts;

const currentYear = new Date().getFullYear()
const currentMonth = new Date().getMonth() + 1 // bulan berjalan (1–12)
const startYear = 2024 // tahun mulai seperti di PHP kamu

const selectedPeriod = ref('') // format: YYYYMM
const matUses = ref([])
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
fetchMaterialUseData()


// event handler select
function onChangePeriod(e) {
  selectedPeriod.value = e.target.value
  fetchMaterialUseData()
}

async function fetchMaterialUseData(){
  loading.value = true
  try {
    const url = selectedPeriod.value
      ? `/matuse/${selectedPeriod.value}`
      : `/matuse`
    const res = await axiosInstance.get(url)
    matUses.value = res.data.data
  } catch (err) {
    console.error('fetch error', err)
    matUses.value = []
  } finally {
    loading.value = false
  }
}

async function exportPDF() {
  if (!selectedPeriod.value) {
    alert('Silakan pilih periode terlebih dahulu!');
    return;
  }

  const rows = matUses.value.map((item, index) => [
    { text: `${index + 1}` },
    { text: item.MUNo },
    { text: formatDate(item.MUDate) },
    { text: item.ItemCode },
    { text: item.InvName },
    { text: item.Unit },
    { text: formatNumber(item.Qty), alignment: 'right' },
    { text: formatNumber(item.SubConQty), alignment: 'right' },
    { text: item.SubContract}
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
          { text: 'LAPORAN PEMAKAIAN BAHAN BAKU', style: 'header' },
          { text: `Periode: ${periodLabel.value}`, style: 'subheader' },
        ],
      };
    },

    // Footer PDF
    footer: function (current, total) {
      return {
          margin: [20, 10],
          columns: [
            {
              text: 'Dicetak: ' + new Date().toLocaleDateString('id-ID'),
              alignment: 'left',
            },
            {
              text: `Halaman ${current} dari ${total}`,
              alignment: 'right',
            },
          ],
          fontSize: 8
      }
    },

    // Content
    content: [
      {
        table: {
          headerRows: 2,
          widths: ['auto','auto','auto','auto','*','auto','auto','auto','auto'],
          body: [
            [
              { text: 'No', rowSpan: 2, style: 'tableHeader' },
              { text: 'Bukti Pengeluaran', colSpan: 2, style: 'tableHeader' },
              {},
              { text: 'Kode Barang', rowSpan: 2, style: 'tableHeader' },
              { text: 'Nama Barang', rowSpan: 2, style: 'tableHeader' },
              { text: 'Satuan', rowSpan: 2, style: 'tableHeader' },
              { text: 'Jumlah', colSpan: 2, style: 'tableHeader' },
              {},
              { text: 'Subkon', rowSpan: 2, style: 'tableHeader' },  
            ],
            [
              {},
              { text: 'No MU', style: 'tableHeader' },
              { text: 'Tanggal', style: 'tableHeader' },
              {},{},{},
              { text: 'Jumlah', style: 'tableHeader' },
              { text: 'Jumlah Subkon', style: 'tableHeader' },  
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
      header: { fontSize: 14, bold: true, alignment: 'center'},
      subheader: { fontSize: 11, alignment: 'center'},
      tableHeader: {
        bold: true,
        fontSize: 8,
        fillColor: "#eeeeee",
        color: "black",
        alignment: "center"
      }
    }
  };

  pdfMake.createPdf(doc).download(`Laporan Pemakaian Bahan Baku_${periodLabel.value}.pdf`);
}

</script>