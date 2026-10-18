
<template>
    <CCard>
        <CCardHeader>
            <strong>Mutasi Hasil Produksi</strong>
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
    import { CButton, CCard, CCardBody, CCardHeader, CFormSelect, CSpinner, CTable, CTableBody, CTableDataCell, CTableHead, CTableHeaderCell, CTableRow } from '@coreui/vue';
    import { formatNumber, monthNames, generatePeriods } from '@/helpers/format'
    import { computed, ref, watch } from 'vue';
    import { axiosInstance } from "@/plugins/axios";
    import CIcon from '@coreui/icons-vue';
    import pdfMake from 'pdfmake/build/pdfmake';
    import pdfFonts from 'pdfmake/build/vfs_fonts';
    import DataTable from "datatables.net-vue3"
    import DataTablesCore from "datatables.net"

    import 'datatables.net-responsive';
    import 'datatables.net-select';

    DataTable.use(DataTablesCore)

    pdfMake.vfs = pdfFonts;

    const currentYear = new Date().getFullYear()
    const currentMonth = new Date().getMonth() + 1 // bulan berjalan (1–12)
    const startYear = 2024 // tahun mulai seperti di PHP kamu

    //const selectedPeriod = ref("202603")
    const selectedPeriod = ref('') // format: YYYYMM
    const finMutt = ref([])

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

    const periodLabel = computed(() => {
      if (!selectedPeriod.value) return ''
      const y = selectedPeriod.value.substring(0, 4)
      const m = parseInt(selectedPeriod.value.substring(4, 6))
      return `${monthNames[m - 1]} ${y}`
    })

    const columns = [

      {
        data: null,
        title: "No",
        render: function (data, type, row, meta) {
          return meta.row + meta.settings._iDisplayStart + 1
        }
      },

      { data: "ItemCode", title: "Kode Barang" },
      { data: "inventory.InvName", title: "Nama Barang" },
      { data: "Unit", title: "Satuan" },
      { data: "Begin", title: "Saldo Awal" },
      { data: "In", title: "Pemasukan" },
      { data: "Out", title: "Pengeluaran" },
      { data: "Ending", title: "Saldo Akhir" },
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

          const res = await axiosInstance.get(`/fgmut`, {
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

      const res = await axiosInstance.get('/fgmut/export', {
        params: {
          period: selectedPeriod.value
        }
      })

      const data = res.data.data ?? res.data

      const rows = data.map((item, index) => [
        { text: index + 1, alignment: "center" },
        { text: item.ItemCode },
        { text: item.InvName },
        { text: item.Unit, alignment: "center" },
        { text: formatNumber(item.Begin), alignment: "right" },
        { text: formatNumber(item.In), alignment: "right" },
        { text: formatNumber(item.Out), alignment: "right" },
        { text: formatNumber(item.Ending), alignment: "right" },
        { text: item.WarehouseName }
      ]);

      const doc = {
        pageSize: "A4",
        pageOrientation: "landscape",
        layout: 'lightHorizontalLines',
        pageMargins: [40, 60, 40, 40],

        // HEADER PDF
        header: function () {
          return {
            margin: [20, 15],
            stack: [
              { text: "LAPORAN MUTASI HASIL PRODUKSI", style: "header" },
              { text: `Periode: ${periodLabel.value}`, style: "subheader" }
            ]
          };
        },

        // FOOTER PDF
        footer: function (current, total) {
          return {
            margin: [20, 10],
            columns: [
              {
                text: "Dicetak: " + new Date().toLocaleDateString("id-ID"),
                alignment: "left"
              },
              {
                text: `Halaman ${current} dari ${total}`,
                alignment: "right"
              }
            ],
            fontSize: 8
          };
        },

        // ISI PDF (TABLE)
        content: [
          {
            table: {
              headerRows: 1,
              dontBreakRows: true,
              widths: ["auto", 60, "*", 40, 60, 60, 60, 60, 60],
              body: [
                [
                  { text: "No", style: "tableHeader" },
                  { text: "Kode Barang", style: "tableHeader" },
                  { text: "Nama Barang", style: "tableHeader" },
                  { text: "Satuan", style: "tableHeader" },
                  { text: "Saldo Awal", style: "tableHeader" },
                  { text: "Pemasukan", style: "tableHeader" },
                  { text: "Pengeluaran", style: "tableHeader" },
                  { text: "Saldo Akhir", style: "tableHeader" },
                  { text: "Gudang", style: "tableHeader" }
                ],
                ...rows
              ]
            },
            fontSize: 8
          }
        ],

        // STYLE
        styles: {
          header: { fontSize: 14, bold: true, alignment: "center" },
          subheader: { fontSize: 11, alignment: "center", margin: [0, 2] },
          tableHeader: {
            bold: true,
            fontSize: 9,
            fillColor: "#eeeeee",
            color: "black",
            alignment: "center"
          }
        }
      };

      pdfMake.createPdf(doc).download(`Laporan Mutasi Hasil Produksi_${periodLabel.value}.pdf`);
    }
</script>
