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
    import { CButton, CCard, CCardBody, CCardHeader, CFormSelect, CSpinner, CTable, CTableBody, CTableDataCell, CTableHead, CTableHeaderCell, CTableRow } from '@coreui/vue'
    import { formatDate, formatNumber, monthNames, generatePeriods } from '@/helpers/format'
    import { computed, ref, watch } from 'vue'
    import CIcon from '@coreui/icons-vue'
    import pdfMake from 'pdfmake/build/pdfmake';
    import pdfFonts from 'pdfmake/build/vfs_fonts';
    import { axiosInstance } from "@/plugins/axios";
    import DataTable from "datatables.net-vue3"
    import DataTablesCore from "datatables.net"

    import 'datatables.net-responsive';
    import 'datatables.net-select';

    DataTable.use(DataTablesCore)

    pdfMake.vfs = pdfFonts;

    const currentYear = new Date().getFullYear()
    const currentMonth = new Date().getMonth() + 1 // bulan berjalan (1–12)
    const startYear = 2025 // tahun mulai

    const selectedPeriod = ref('') // format: YYYYMM
    const finGoods = ref([])

    const periodLabel = computed(() => {
        if (!selectedPeriod.value) return ''
        const y = selectedPeriod.value.substring(0, 4)
        const m = parseInt(selectedPeriod.value.substring(4, 6))
        return `${monthNames[m - 1]} ${y}`
    })

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

    const groupedPeriods = computed(() => 
        generatePeriods(startYear, currentYear, currentMonth)
    )

    const columns = [

      {
        data: null,
        title: "No",
        render: function (data, type, row, meta) {
          return meta.row + meta.settings._iDisplayStart + 1
        }
      },

      { data: "FGNo", title: "No. Bukti Terima" },
      { 
        data: "FGDate", 
        title: "Tanggal",
        render: function (data) {
            return formatDate(data)
        }
      },
      { data: "ItemCode", title: "Kode Barang" },
      { data: "inventory.InvName", title: "Nama Barang" },
      { data: "Unit", title: "Satuan", className: "dt-right"  },
      { 
        data: "Qty", 
        title: "Dari Produksi", 
        className: "dt-right",
        render: function (data) {
            return formatNumber(data)
        }  
      },
      { data: "SubContract", title: "Sub Kontrak" },
      { data: "SubConQty", title: "Dari Sub Kontrak" },
      { data: "WarehouseName", title: "Gudang" }
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

          const res = await axiosInstance.get(`/fingoods`, {
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
    
    async function exportPDF() {
        const res = await axiosInstance.get('/fingoods/export', {
            params: {
                period: selectedPeriod.value
            }
        })

        const data = res.data.data ?? res.data

        const rows = data.map((item,index) => [
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