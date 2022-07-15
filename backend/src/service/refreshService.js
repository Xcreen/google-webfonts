let serviceRunning = false
let serviceIntervalTimeout = 15 * 60 * 1000

const refreshConfig = () => {
  console.log('Refeshing Google Webfonts ...')
  //TODO: Get current Google Webfonts JSON
}

module.exports = {
  start: () => {
    console.log('Starting Refresh-Service')
    serviceRunning = true
    refreshConfig();
    let serviceInterval = setInterval(() => {
      if(!serviceRunning) {
        clearInterval(serviceInterval)
        return
      }
      refreshConfig();
    }, serviceIntervalTimeout)
  },
  stop: () => {
    serviceRunning = false
    console.log('Stopped Refresh-Service')
  }
}

