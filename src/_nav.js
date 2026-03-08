export default [
  {
    component: 'CNavItem',
    name: 'Dashboard',
    to: '/dashboard',
    icon: 'cil-speedometer',
    badge: {
      color: 'primary',
      text: 'NEW',
    },
  },
  {
    component: 'CNavTitle',
    name: 'laporan bea cukai',
  },
  {
    component: 'CNavGroup',
    name: 'Inventory Report',
    to: '/report',
    icon: 'cil-notes',
    items: [
      {
        component: 'CNavItem',
        name: 'Pemasukan Bahan Baku',
        to: '/report/pemasukkanBB',
      },
      {
        component: 'CNavItem',
        name: 'Pemakaian Bahan Baku',
        to: '/report/pemakaianBB',
      },
      {
        component: 'CNavItem',
        name: 'Pemasukan Hasil Prod',
        to: '/report/pemasukanHP',
      },
      {
        component: 'CNavItem',
        name: 'Pengeluaran Hasil Prod',
        to: '/report/pengeluaranHP',
      },
      {
        component: 'CNavItem',
        name: 'Mutasi Bahan Baku',
        to: '/report/mutasiBB',
      },
      {
        component: 'CNavItem',
        name: 'Mutasi Hasil Produksi',
        to: '/report/mutasiHP',
      },
      {
        component: 'CNavItem',
        name: 'Penyelesaian Waste',
        to: '/report/waste',
      },
    ]
  },
  {
    component: 'CNavTitle',
    name: 'Master Data'
  },
  {
    component: 'CNavItem',
    name: 'User',
    to: '/masterdata/user',
    icon: 'cil-people'
  },
]
