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
      <div class="table-responsive text-nowrap">
        <CTable hover bordered small>
          <CTableHead align="center" color="light">
            <CTableRow>
              <CTableHeaderCell>No</CTableHeaderCell>
              <CTableHeaderCell>Tgl. Rekam</CTableHeaderCell>
              <CTableHeaderCell>Jns. Dokumen</CTableHeaderCell>
              <CTableHeaderCell>No. PIB</CTableHeaderCell>
              <CTableHeaderCell>tgl. PIB</CTableHeaderCell>
              <CTableHeaderCell>No. Seri Brg.</CTableHeaderCell>
              <CTableHeaderCell>No. BTB</CTableHeaderCell>
              <CTableHeaderCell>Tgl. BTB</CTableHeaderCell>
              <CTableHeaderCell class="text-end">Kode Barang</CTableHeaderCell>
              <CTableHeaderCell>HS. Code</CTableHeaderCell>
              <CTableHeaderCell>Nama Barang</CTableHeaderCell>
              <CTableHeaderCell>Satuan</CTableHeaderCell>
              <CTableHeaderCell>Qty</CTableHeaderCell>
              <CTableHeaderCell>Mata Uang</CTableHeaderCell>
              <CTableHeaderCell>Nilai Barang</CTableHeaderCell>
              <CTableHeaderCell>Sub Kontrak</CTableHeaderCell>
              <CTableHeaderCell>Negara Asal</CTableHeaderCell>
              <CTableHeaderCell>Harga Satuan</CTableHeaderCell>
              <CTableHeaderCell>Rate</CTableHeaderCell>
              <CTableHeaderCell>Harga Satuan Konversi</CTableHeaderCell>
              <CTableHeaderCell>Nilai Barang Konversi</CTableHeaderCell>
              <CTableHeaderCell>No. PO</CTableHeaderCell>
              <CTableHeaderCell>Fasilitas</CTableHeaderCell>
              <CTableHeaderCell>No. Invoice</CTableHeaderCell>
            </CTableRow>
          </CTableHead>

          <CTableBody>
            <CTableRow v-if="loading">
              <CTableDataCell colspan="13" class="text-center">
                <CSpinner size="sm" color="primary" /> Loading data...
              </CTableDataCell>
            </CTableRow>

            <CTableRow v-else-if="purchases.length === 0">
              <CTableDataCell colspan="13" class="text-center">
                Tidak ada data
              </CTableDataCell>
            </CTableRow>

            <CTableRow v-else v-for="(item, index) in purchases" :key="index">
              <CTableDataCell>{{ index + 1 }}</CTableDataCell>
              <CTableDataCell></CTableDataCell>
              <CTableDataCell>{{ item.DocType }}</CTableDataCell>
              <CTableDataCell>{{ item.PIBNo }}</CTableDataCell>
              <CTableDataCell>{{ formatDate(item.PIBDate) }}</CTableDataCell>
              <CTableDataCell>{{ item.SerialNo }}</CTableDataCell>
              <CTableDataCell>{{ item.GRNo }}</CTableDataCell>
              <CTableDataCell>{{ formatDate(item.GRDate) }}</CTableDataCell>
              <CTableDataCell>{{ item.ItemCode }}</CTableDataCell>
              <CTableDataCell>{{ item.HSCode }}</CTableDataCell>
              <CTableDataCell>{{ item.InvName }}</CTableDataCell>
              <CTableDataCell>{{ item.Unit }}</CTableDataCell>
              <CTableDataCell class="text-end">{{ formatNumber(item.Qty) }}</CTableDataCell>
              <CTableDataCell>{{ item.Currency }}</CTableDataCell>
              <CTableDataCell class="text-end">{{ formatNumber(item.Amount) }}</CTableDataCell>
              <CTableDataCell>{{ item.SubContract }}</CTableDataCell>
              <CTableDataCell>{{ item.Origin }}</CTableDataCell>
              <CTableDataCell class="text-end">{{ formatNumber(item.Up) }}</CTableDataCell>
              <CTableDataCell class="text-end">{{ formatNumber(item.Rate) }}</CTableDataCell>
              <CTableDataCell class="text-end">{{ formatNumber(item.ConUp) }}</CTableDataCell>
              <CTableDataCell class="text-end">{{ formatNumber(item.ConAmount) }}</CTableDataCell>
              <CTableDataCell>{{ item.OrderNo }}</CTableDataCell>
              <CTableDataCell>{{ item.FacilitiesName }}</CTableDataCell>
              <CTableDataCell>{{ item.InvNo }}</CTableDataCell>
            </CTableRow>
          </CTableBody>
        </CTable>
      </div>
    </CCardBody>
  </CCard>
</template>

<script setup>
import { ref, computed } from 'vue'
import { generatePeriods, monthNames, formatDate, formatNumber } from '@/helpers/format.js'
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { axiosInstance } from "@/plugins/axios";


pdfMake.vfs = pdfFonts;

const currentYear = new Date().getFullYear()
const currentMonth = new Date().getMonth() + 1 // bulan berjalan (1–12)
const startYear = 2024 // tahun mulai seperti di PHP kamu

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
fetchPurchaseData()


// event handler select
function onChangePeriod(e) {
  selectedPeriod.value = e.target.value
  fetchPurchaseData()
}

// fetch data dari API
async function fetchPurchaseData() {
  loading.value = true
  try {
    const url = selectedPeriod.value
      ? `/purchases/${selectedPeriod.value}`
      : `/purchases`
    const res = await axiosInstance.get(url)
    // console.log(res.data);
    purchases.value = res.data.data
  } catch (err) {
    console.error('fetch error', err)
    purchases.value = []
  } finally {
    loading.value = false
  }
}

if (pdfFonts && pdfFonts.pdfMake && pdfFonts.pdfMake.vfs) {
  pdfMake.vfs = pdfFonts.pdfMake.vfs
} else if (pdfFonts && pdfFonts.vfs) {
  pdfMake.vfs = pdfFonts.vfs
}

// Cetak PDF
async function exportPDF() {
  if (!selectedPeriod.value) {
    alert('Silakan pilih periode terlebih dahulu!');
    return;
  }
  
  const rows = purchases.value.map((item, index) => [
    { text: `${index + 1}`},
    { text: item.DocType },
    { text: item.PIBNo },
    { text: formatDate(item.PIBDate) },
    { text: item.SerialNo },
    { text: item.HSCode },
    { text: item.GRNo },
    { text: formatDate(item.GRDate) },
    { text: item.ItemCode },
    { text: item.InvName },
    { text: item.Unit },
    { text: formatNumber(item.Qty) },
    { text: item.Currency },
    { text: formatNumber(item.Amount) },
    { text: item.WarehouseName },
    { text: item.SubContract },
    { text: item.Origin },
  ])

  const doc = {
    pageSize: 'A4',
    pageOrientation: 'landscape',
    pageMargins: [40, 60, 40, 40],

    header: function () {
      return {
        margin: [20, 15],
        stack: [
          { text: 'LAPORAN PEMASUKAN BAHAN BAKU', style: 'header' },
          { text: `Periode: ${periodLabel.value}`, style: 'subheader' },
        ],
      }
    },

    footer: function (currentPage, pageCount) {
      return {
        margin: [20, 10],
        columns: [
          { text: 'Dicetak: ' + new Date().toLocaleDateString('id-ID'), alignment: 'left' },
          { text: `Halaman ${currentPage} dari ${pageCount}`, alignment: 'right' },
        ],
        fontSize: 8,
      }
    },

    content: [
      {
        table: {
          headerRows: 2,
          widths: ['auto','auto','auto','auto','auto','auto','auto','auto','auto',60,'auto','auto','auto','auto','auto','auto','auto'],
          body: [
            [
              { text: 'No', rowSpan: 2, style: 'tableHeader' },
              { text: 'Jenis Dokumen', rowSpan: 2, style: 'tableHeader' },
              { text: 'Dokumen Pabean', colSpan: 4, style: 'tableHeader' },
              {},{},{},
              { text: 'Bukti Penerimaan Barang', colSpan: 2, style: 'tableHeader' },
              {},
              { text: 'Kode Barang', rowSpan: 2, style: 'tableHeader' },
              { text: 'Nama Barang', rowSpan: 2, style: 'tableHeader' },
              { text: 'Satuan', rowSpan: 2, style: 'tableHeader' },
              { text: 'Jumlah', rowSpan: 2, style: 'tableHeader' },
              { text: 'Mata Uang', rowSpan: 2, style: 'tableHeader' },
              { text: 'Nilai Barang', rowSpan: 2, style: 'tableHeader' },
              { text: 'Gudang', rowSpan: 2, style: 'tableHeader' },
              { text: 'Penerima Sub Kontrak', rowSpan: 2, style: 'tableHeader' },
              { text: 'Negara Asal', rowSpan: 2, style: 'tableHeader' },
            ],
            [
              {},
              {},
              { text: 'No PIB', style: 'tableHeader' },
              { text: 'Tgl. PIB', style: 'tableHeader' },
              { text: 'No. Seri', style: 'tableHeader' },
              { text: 'Kode HS', style: 'tableHeader' },
              { text: 'Nomer BPB', style: 'tableHeader' },
              { text: 'Tgl. BPB', style: 'tableHeader' },
              {},{},{},{},{},{},{},{},{}
            ],
            ...rows
          ]
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

  pdfMake.createPdf(doc).download(`Pemasukan Bahan Baku_${periodLabel.value}.pdf`);
}
</script>
