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
  import { ref, computed, watch } from 'vue'
  import { generatePeriods, monthNames, formatDate, formatNumber } from '@/helpers/format.js'
  import pdfMake from 'pdfmake/build/pdfmake';
  import pdfFonts from 'pdfmake/build/vfs_fonts';
  import { axiosInstance } from "@/plugins/axios";
  import DataTable from "datatables.net-vue3";
  import DataTablesCore from "datatables.net";

  import 'datatables.net-responsive';
  import 'datatables.net-select';

  DataTable.use(DataTablesCore)

  pdfMake.vfs = pdfFonts;

  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth() + 1 // bulan berjalan (1–12)
  const startYear = 2025 // tahun mulai

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

  // event handler select
  function onChangePeriod(e) {
    selectedPeriod.value = e.target.value
  }

  watch(selectedPeriod, () => {
    if (tableRef.value) {
      tableRef.value.dt.ajax.reload(null, true)
    }
  });

  const columns = [

    {
      data: null,
      title: "No",
      render: function (data, type, row, meta) {
        return meta.row + meta.settings._iDisplayStart + 1
      }
    },
    { data: null, 
      title: "Tgl. Rekam",
      render: function (data, type, row, meta) {
        return ""
      }
    },
    { data: "DocType", title: "Jns Dokumen" },
    { data: "PIBNo", title: "No. PIB" },
    { 
      data: "PIBDate", 
      title: "tgl. PIB",
      render: function (data){
        return formatDate(data)
      }
    },
    { data: "SerialNo", title: "No. Seri Brg.", className: "dt-right"  },
    { data: "GRNo", title: "No. BTB" },
    { 
      data: "GRDate", 
      title: "tgl. BTB",
      render: function (data){
        return formatDate(data)
      }
    },
    { data: "ItemCode", title: "Kode Barang" },
    { data: "inventory.HSCode", title: "HS Code" },
    { data: "inventory.InvName", title: "Nama Barang" },
    { data: "Unit", title: "Satuan" },
    { data: "Qty", title: "Qty" },
    { data: "Currency", title: "Mata Uang" },
    { data: "Amount", title: "Nilai Barang" },
    { data: "SubContract", title: "Sub Kontrak" },
    { data: "Origin", title: "Negara Asal" },
    { data: "Up", title: "Harga Satuan" },
    { data: "Rate", title: "Rate" },
    { data: "ConUp", title: "Harga Satuan Konversi" },
    { data: "ConAmount", title: "Nilai Barang Konversi" },
    { data: "OrderNo", title: "No. PO" },
    { data: "FacilitiesName", title: "Fasilitas" },
    { data: "InvNo", title: "No. Invoice" },
  ]


  const options = {

    processing: true,
    serverSide: true,
    responsive: true,
    select: true,

    ajax: async (data, callback) => {

      const page = data.start / data.length + 1
      const perPage = data.length

      try {

        const res = await axiosInstance.get(`/purchases`, {
          params: {
            period: selectedPeriod.value,
            draw: data.draw,
            start: data.start,
            length: data.length,
            search: data.search.value,
            order: data.order
          }
        })
        callback(res.data)
      } catch (err) {
        console.error(err)
      }
    }
  }
  
  // fetch data dari API
  // async function fetchPurchaseData() {
  //   loading.value = true
  //   try {
  //     const url = selectedPeriod.value
  //       ? `/purchases/${selectedPeriod.value}`
  //       : `/purchases`
  //     const res = await axiosInstance.get(url)
  //     // console.log(res.data);
  //     purchases.value = res.data.data
  //   } catch (err) {
  //     console.error('fetch error', err)
  //     purchases.value = []
  //   } finally {
  //     loading.value = false
  //   }
  // }

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
