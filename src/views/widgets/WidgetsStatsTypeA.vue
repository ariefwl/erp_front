<script setup>
import { onMounted, ref } from 'vue'
import { CChart } from '@coreui/vue-chartjs'
import { getStyle } from '@coreui/utils'
import { axiosInstance } from '@/plugins/axios'

const widgetChartRef1 = ref()
const widgetChartRef2 = ref()
const totalPurchase = ref(0)
const totalMatUse = ref(0)
const totalFinGoods = ref(0)
const totalSales = ref(0)
const totalMatMut = ref(0)
const totalFGMut = ref(0)
const totalWaste = ref(0)

const currentMonth = new Date().toLocaleDateString('id-ID', {
  month: 'long',
  year: 'numeric'
});

// Format: 202512 → yearmonth
const thisMonth = new Date().toISOString().slice(0, 7).replace("-", "");

async function loadTotalPurchase() {
  try {
    const res = await axiosInstance.get(`/purchase/count/${thisMonth}`);
    totalPurchase.value = res.data.total;
  } catch (error) {
    console.error(error)
  }  
}

async function loadTotalMatUse(){
  try {
    const res = await axiosInstance.get(`/matuse/count/${thisMonth}`);
    totalMatUse.value = res.data.total;
  } catch (error) {
    console.error(error)
  }
}

async function loadTotalFinGoods(){
  try {
    const res = await axiosInstance.get(`/fingoods/count/${thisMonth}`);
    totalFinGoods.value = res.data.total;
  } catch (error) {
    console.error(error)
  }
}

async function loadTotalSales() {
  try {
    const res = await axiosInstance.get(`/sales/count/${thisMonth}`);
    totalSales.value = res.data.total;
  } catch (error) {
    console.error(error)
  }
}

async function loadTotalMatMut() {
  try {
    const res = await axiosInstance.get(`/matmut/count/${thisMonth}`);
    totalMatMut.value = res.data.total;
  } catch (error) {
    console.error(error)
  }
}

async function loadTotalFGMutation(){
  try {
    const res = await axiosInstance.get(`/fgmut/count/${thisMonth}`);
    totalFGMut.value = res.data.total;
  } catch (error) {
    console.error(error)
  }
}

async function loadTotalWaste(){
  try {
    const res = await axiosInstance.get(`/waste/count/${thisMonth}`);
    totalWaste.value = res.data.total;
  } catch (error) {
    console.error(error)
  }
}

onMounted(() => {
  document.documentElement.addEventListener('ColorSchemeChange', () => {
    if (widgetChartRef1.value) {
      widgetChartRef1.value.chart.data.datasets[0].pointBackgroundColor = getStyle('--cui-primary')
      widgetChartRef1.value.chart.update()
    }

    if (widgetChartRef2.value) {
      widgetChartRef2.value.chart.data.datasets[0].pointBackgroundColor = getStyle('--cui-info')
      widgetChartRef2.value.chart.update()
    }
  })

  loadTotalPurchase();
  loadTotalMatUse();
  loadTotalFinGoods();
  loadTotalSales();
  loadTotalMatMut();
  loadTotalFGMutation();
  loadTotalWaste();
})
</script>

<template>
  <CRow :xs="{ gutter: 4 }">
    <CCol :sm="6" :xl="4" :xxl="3">
      <CWidgetStatsA color="primary">
        <template #value> {{ totalPurchase }} Item
          <!-- <span class="fs-6 fw-normal"> (-12.4% <CIcon icon="cil-arrow-bottom" />) </span> -->
        </template>
        <template #title>Pemasukkan Bahan Baku {{ currentMonth }}</template>
        <template #action>
          <router-link to="/report/pemasukkanBB" class="text-decoration-none text-white">
            Details
          </router-link>
        </template>
        <template #chart>
          <CChart
            type="line"
            class="mt-3 mx-3"
            style="height: 70px"
            ref="widgetChartRef1"
            :data="{
              labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
              datasets: [
                {
                  label: 'My First dataset',
                  backgroundColor: 'transparent',
                  borderColor: 'rgba(255,255,255,.55)',
                  pointBackgroundColor: getStyle('--cui-primary'),
                  data: [68, 59, 84, 84, 51, 55, 40],
                },
              ],
            }"
            :options="{
              plugins: {
                legend: {
                  display: false,
                },
              },
              maintainAspectRatio: false,
              scales: {
                x: {
                  border: {
                    display: false,
                  },
                  grid: {
                    display: false,
                  },
                  ticks: {
                    display: false,
                  },
                },
                y: {
                  min: 30,
                  max: 89,
                  display: false,
                  grid: {
                    display: false,
                  },
                  ticks: {
                    display: false,
                  },
                },
              },
              elements: {
                line: {
                  borderWidth: 1,
                  tension: 0.4,
                },
                point: {
                  radius: 4,
                  hitRadius: 10,
                  hoverRadius: 4,
                },
              },
            }"
          />
        </template>
      </CWidgetStatsA>
    </CCol>
    <CCol :sm="6" :xl="4" :xxl="3">
      <CWidgetStatsA color="info">
        <template #value
          > {{ totalMatUse }} Item
          <!-- <span class="fs-6 fw-normal"> (40.9% <CIcon icon="cil-arrow-top" />) </span> -->
        </template>
        <template #title>Pemakaian Bahan Baku {{ currentMonth }}</template>
        <template #action>
          <router-link to="/report/pemakaianBB" class="text-decoration-none text-white">
            Details
          </router-link>
        </template>
        <template #chart>
          <CChart
            type="line"
            class="mt-3 mx-3"
            style="height: 70px"
            ref="widgetChartRef2"
            :data="{
              labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
              datasets: [
                {
                  label: 'My First dataset',
                  backgroundColor: 'transparent',
                  borderColor: 'rgba(255,255,255,.55)',
                  pointBackgroundColor: getStyle('--cui-info'),
                  data: [1, 18, 9, 17, 34, 22, 11],
                },
              ],
            }"
            :options="{
              plugins: {
                legend: {
                  display: false,
                },
              },
              maintainAspectRatio: false,
              scales: {
                x: {
                  border: {
                    display: false,
                  },
                  grid: {
                    display: false,
                  },
                  ticks: {
                    display: false,
                  },
                },
                y: {
                  min: -9,
                  max: 39,
                  display: false,
                  grid: {
                    display: false,
                  },
                  ticks: {
                    display: false,
                  },
                },
              },
              elements: {
                line: {
                  borderWidth: 1,
                },
                point: {
                  radius: 4,
                  hitRadius: 10,
                  hoverRadius: 4,
                },
              },
            }"
          />
        </template>
      </CWidgetStatsA>
    </CCol>
    <CCol :sm="6" :xl="4" :xxl="3">
      <CWidgetStatsA color="warning">
        <template #value
          > {{ totalFinGoods }} Item
          <!-- <span class="fs-6 fw-normal"> (84.7% <CIcon icon="cil-arrow-top" />) </span> -->
        </template>
        <template #title>Pemasukkan Hasil Produksi {{ currentMonth }}</template>
        <template #action>
          <router-link to="/report/pemasukanHP" class="text-decoration-none text-white">
            Details
          </router-link>
        </template>
        <template #chart>
          <CChart
            type="line"
            class="mt-3"
            style="height: 70px"
            :data="{
              labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
              datasets: [
                {
                  label: 'My First dataset',
                  backgroundColor: 'rgba(255,255,255,.2)',
                  borderColor: 'rgba(255,255,255,.55)',
                  data: [78, 81, 80, 45, 34, 12, 40],
                  fill: true,
                },
              ],
            }"
            :options="{
              plugins: {
                legend: {
                  display: false,
                },
              },
              maintainAspectRatio: false,
              scales: {
                x: {
                  border: {
                    display: false,
                  },
                  display: false,
                },
                y: {
                  display: false,
                },
              },
              elements: {
                line: {
                  borderWidth: 2,
                  tension: 0.4,
                },
                point: {
                  radius: 0,
                  hitRadius: 10,
                  hoverRadius: 4,
                },
              },
            }"
          />
        </template>
      </CWidgetStatsA>
    </CCol>
    <CCol :sm="6" :xl="4" :xxl="3">
      <CWidgetStatsA color="danger">
        <template #value
          > {{ totalSales }} Item
          <!-- <span class="fs-6 fw-normal"> (-23.6% <CIcon icon="cil-arrow-bottom" />) </span> -->
        </template>
        <template #title>Pengeluaran Hasil Produksi {{ currentMonth }}</template>
        <template #action>
          <router-link to="/report/pengeluaranHP" class="text-decoration-none text-white">
            Details
          </router-link>
        </template>
        <template #chart>
          <CChart
            type="bar"
            class="mt-3 mx-3"
            style="height: 70px"
            :data="{
              labels: [
                'January',
                'February',
                'March',
                'April',
                'May',
                'June',
                'July',
                'August',
                'September',
                'October',
                'November',
                'December',
                'January',
                'February',
                'March',
                'April',
              ],
              datasets: [
                {
                  label: 'My First dataset',
                  backgroundColor: 'rgba(255,255,255,.2)',
                  borderColor: 'rgba(255,255,255,.55)',
                  data: [78, 81, 80, 45, 34, 12, 40, 85, 65, 23, 12, 98, 34, 84, 67, 82],
                  barPercentage: 0.6,
                },
              ],
            }"
            :options="{
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: false,
                },
              },
              scales: {
                x: {
                  grid: {
                    display: false,
                    drawTicks: false,
                  },
                  ticks: {
                    display: false,
                  },
                },
                y: {
                  border: {
                    display: false,
                  },
                  grid: {
                    display: false,
                    drawTicks: false,
                  },
                  ticks: {
                    display: false,
                  },
                },
              },
            }"
          />
        </template>
      </CWidgetStatsA>
    </CCol>
    <CCol :sm="6" :xl="4" :xxl="3">
      <CWidgetStatsA color="success">
        <template #value
          > {{ totalMatMut }} Item
          <!-- <span class="fs-6 fw-normal"> (-23.6% <CIcon icon="cil-arrow-bottom" />) </span> -->
        </template>
        <template #title>Mutasi Bahan Baku {{ currentMonth }}</template>
        <template #action>
          <router-link to="/report/mutasiBB" class="text-decoration-none text-white">
            Details
          </router-link>
        </template>
        <template #chart>
          <CChart
            type="bar"
            class="mt-3 mx-3"
            style="height: 70px"
            :data="{
              labels: [
                'January',
                'February',
                'March',
                'April',
                'May',
                'June',
                'July',
                'August',
                'September',
                'October',
                'November',
                'December',
                'January',
                'February',
                'March',
                'April',
              ],
              datasets: [
                {
                  label: 'My First dataset',
                  backgroundColor: 'rgba(255,255,255,.2)',
                  borderColor: 'rgba(255,255,255,.55)',
                  data: [78, 81, 80, 45, 34, 12, 40, 85, 65, 23, 12, 98, 34, 84, 67, 82],
                  barPercentage: 0.6,
                },
              ],
            }"
            :options="{
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: false,
                },
              },
              scales: {
                x: {
                  grid: {
                    display: false,
                    drawTicks: false,
                  },
                  ticks: {
                    display: false,
                  },
                },
                y: {
                  border: {
                    display: false,
                  },
                  grid: {
                    display: false,
                    drawTicks: false,
                  },
                  ticks: {
                    display: false,
                  },
                },
              },
            }"
          />
        </template>
      </CWidgetStatsA>
    </CCol>
    <CCol :sm="6" :xl="4" :xxl="3">
      <CWidgetStatsA color="secondary">
        <template #value
          > {{ totalFGMut }} Item
          <!-- <span class="fs-6 fw-normal"> (-23.6% <CIcon icon="cil-arrow-bottom" />) </span> -->
        </template>
        <template #title>Mutasi Hasil Produksi {{ currentMonth }}</template>
        <template #action>
          <router-link to="/report/mutasiHP" class="text-decoration-none text-white">
            Details
          </router-link>
        </template>
        <template #chart>
          <CChart
            type="bar"
            class="mt-3 mx-3"
            style="height: 70px"
            :data="{
              labels: [
                'January',
                'February',
                'March',
                'April',
                'May',
                'June',
                'July',
                'August',
                'September',
                'October',
                'November',
                'December',
                'January',
                'February',
                'March',
                'April',
              ],
              datasets: [
                {
                  label: 'My First dataset',
                  backgroundColor: 'rgba(255,255,255,.2)',
                  borderColor: 'rgba(255,255,255,.55)',
                  data: [78, 81, 80, 45, 34, 12, 40, 85, 65, 23, 12, 98, 34, 84, 67, 82],
                  barPercentage: 0.6,
                },
              ],
            }"
            :options="{
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: false,
                },
              },
              scales: {
                x: {
                  grid: {
                    display: false,
                    drawTicks: false,
                  },
                  ticks: {
                    display: false,
                  },
                },
                y: {
                  border: {
                    display: false,
                  },
                  grid: {
                    display: false,
                    drawTicks: false,
                  },
                  ticks: {
                    display: false,
                  },
                },
              },
            }"
          />
        </template>
      </CWidgetStatsA>
    </CCol>
    <CCol :sm="6" :xl="4" :xxl="3">
      <CWidgetStatsA color="dark">
        <template #value
          > {{ totalWaste }} Item
          <!-- <span class="fs-6 fw-normal"> (-23.6% <CIcon icon="cil-arrow-bottom" />) </span> -->
        </template>
        <template #title>Penyelesaian Waste / Scrape {{ currentMonth }}</template>
        <template #action>
          <router-link to="/report/waste" class="text-decoration-none text-white">
            Details
          </router-link>
        </template>
        <template #chart>
          <CChart
            type="bar"
            class="mt-3 mx-3"
            style="height: 70px"
            :data="{
              labels: [
                'January',
                'February',
                'March',
                'April',
                'May',
                'June',
                'July',
                'August',
                'September',
                'October',
                'November',
                'December',
                'January',
                'February',
                'March',
                'April',
              ],
              datasets: [
                {
                  label: 'My First dataset',
                  backgroundColor: 'rgba(255,255,255,.2)',
                  borderColor: 'rgba(255,255,255,.55)',
                  data: [78, 81, 80, 45, 34, 12, 40, 85, 65, 23, 12, 98, 34, 84, 67, 82],
                  barPercentage: 0.6,
                },
              ],
            }"
            :options="{
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: false,
                },
              },
              scales: {
                x: {
                  grid: {
                    display: false,
                    drawTicks: false,
                  },
                  ticks: {
                    display: false,
                  },
                },
                y: {
                  border: {
                    display: false,
                  },
                  grid: {
                    display: false,
                    drawTicks: false,
                  },
                  ticks: {
                    display: false,
                  },
                },
              },
            }"
          />
        </template>
      </CWidgetStatsA>
    </CCol>
  </CRow>
</template>
