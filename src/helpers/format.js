export function formatDate(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  return `${day}/${month}/${year}`
}

export function formatNumber(num) {
  if (num === null || num === undefined || num === '') return ''

    const value = Number(num)

    if (isNaN(value)) return ''

    return value.toLocaleString('id-ID', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })
}

export function formatDatee(value) {
    if (!value) return ''

    // ambil YYYY-MM-DD saja
    const date = value.slice(0, 10)

    // YYYY-MM-DD -> DD-MM-YYYY
    return date.split('-').reverse().join('-')
}

export function formatPeriod(period) {
  const year = period.substring(0, 4)
  const month = parseInt(period.substring(4, 6))
  const monthNames = [
    'Januari','Februari','Maret','April','Mei','Juni',
    'Juli','Agustus','September','Oktober','November','Desember'
  ]
  return `${monthNames[month - 1]} ${year}`
}

export function generateColumns(columns) {
    return columns.map(col => {

        if (col.type === 'rownum') {
            return {
                ...col,
                formatter: (row, index) => {
                    return (params.current_page - 1) * params.pagesize + index + 1
                }
            }
        }
        
        if (col.type === 'date') {
            return {
                ...col,
                formatter: (row) => formatDatee(row[col.field])
            }
        }

        if (col.type === 'number'){
           return {
                ...col,
                formatter: (row) => formatNumber(row[col.field])
           }
        }

        return col
    })
}

export const monthNames = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
]

export function generatePeriods(startYear, currentYear, currentMonth) {
  const groups = {}

  for (let y = startYear; y <= currentYear; y++) {
    const lastMonth = y === currentYear ? currentMonth : 12
    groups[y] = []

    for (let m = 1; m <= lastMonth; m++) {
      const mm = String(m).padStart(2, '0')
      const value = `${y}${mm}`
      const label = `${monthNames[m - 1]} ${y}`

      groups[y].push({ value, label })
    }
  }

  return groups
}
