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
    name: 'CUSTOMS report',
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
    component: 'CNavGroup',
    name: 'Bounded Zone Report',
    to: '/kaber',
    icon: 'cil-notes',
    items: [
        {
          component: 'CNavItem',
          name: 'Pemasukan Bahan Baku',
          to: '/kaber/pemasukanBB',
        },
        {
          component: 'CNavItem',
          name: 'Pengeluaran Hasil Produksi',
          to: '/kaber/pengeluaranHP',
        },
        {
          component: 'CNavItem',
          name: 'Mutasi Bahan Baku',
          to: '/kaber/mutasiBB',
        },
        {
          component: 'CNavItem',
          name: 'Posisi Barang Dalam Proses',
          to: '/kaber/wip',
        },
        {
          component: 'CNavItem',
          name: 'Mutasi Hasil Produksi',
          to: '/kaber/mutasiHP',
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
