export function formatDate(value) {
    if (!value) return ''

    const d = new Date(value)
    if (isNaN(d.getTime())) return value

    return `${String(d.getDate()).padStart(2,'0')}-${String(d.getMonth()+1).padStart(2,'0')}-${d.getFullYear()}`
}

export function generateColumns(columns) {
    return columns.map(col => {

        if (col.type === 'date') {
            return {
                ...col,
                formatter: (row) => formatDate(row[col.field])
            }
        }

        return col
    })
}