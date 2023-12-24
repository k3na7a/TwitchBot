import * as fs from 'fs'
import path from 'path'

import moment from 'moment'
import Bull from 'bull'

const loggerQueue = new Bull('logger-queue', {
  redis: { host: '127.0.0.1', port: 6379 },
  limit: { max: 1 }
})

function readFile(srcPath) {
  if (fs.existsSync(srcPath))
    return fs.readFileSync(srcPath, { encoding: 'utf-8' })
  else return undefined
}

function logger(payload) {
  const dateString = new Date(Date.now()).toDateString()
  const srcPath = path.join(process.cwd(), `./logs/${dateString}.txt`)

  let logs = readFile(srcPath)

  if (!logs) logs = `LOG START -- ${dateString}`
  logs += `\n${payload}`

  fs.writeFile(srcPath, logs, (res, err) => {
    if (err) console.log(err)
  })
}

loggerQueue.process((payload, done) => {
  try {
    const { $message } = payload.data

    const MOMENT = moment().format('HH:mm')
    const message = `[${MOMENT}] ${$message}`

    console.log(message)
    logger(message)

    done()
  } catch (err) {
    done(err)
  }
})

export { loggerQueue }
