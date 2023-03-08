function formatTimeFromMinutes(time: number) {
    if (!time || time <= 0) {
        return ''
    }
    let hours = Math.floor(time / 60)
    let minutes = time % 60
    let string = ''
    if (hours === 1) {
        string += `${hours} hr`
    } else if (hours > 1) {
        string += `${hours} hrs`
    }
    if (minutes === 1) {
        string += `${minutes} min`
    } else if (minutes > 1) {
        string += `${minutes} mins`
    }
    return string
}

function formatTimeAsDigitalFromMinutes(time: number) {
    if (!time || time <= 0) {
        return ''
    }
    let hours = Math.floor(time / 60)
    let minutes = time % 60
    return `0${hours}:${minutes}`
}

export { formatTimeFromMinutes, formatTimeAsDigitalFromMinutes }