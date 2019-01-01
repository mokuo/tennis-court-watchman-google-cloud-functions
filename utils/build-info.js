const buildInfo = (availableDateTimeObj) => {
  let info = ''

  Object.keys(availableDateTimeObj).forEach((key) => {
    const times = availableDateTimeObj[key]
    if (times.length === 0) { return }

    info += `${key}\n`
    times.forEach((time) => {
      info += `  - ${time}\n`
    })
  })

  return info
}

module.exports = buildInfo
