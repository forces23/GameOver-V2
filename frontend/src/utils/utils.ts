
export const formatUnixTime = (unixDate:any) => {
    const timestamp = Number(unixDate) * 1000
    const date = new Date(timestamp);
    return date.toLocaleDateString()
} 