/*
  TemPolor i4 instrumental via the useapi.net TemPolor API: submit, poll, download every track.
  Docs: https://useapi.net/docs/api-tempolor-v1

  Usage (Node.js v21 or newer, no dependencies):
    export USEAPI_TOKEN=user:12345-...        # your useapi.net API token
    node instrumental.mjs ["prompt"] [tonality] [bpm] [chords]

  Example:
    node instrumental.mjs "Lo-fi hip hop with dusty piano and soft drums" A:minor 90 "Am F C G"
*/

import { writeFile } from 'node:fs/promises'

const token = process.env.USEAPI_TOKEN
if (!token) {
  console.error('Set USEAPI_TOKEN to your useapi.net API token, see https://useapi.net/docs/start-here/setup-useapi')
  process.exit(1)
}

const [prompt = 'A relaxing lo-fi beat with piano and soft drums', tonality, bpm, chords] = process.argv.slice(2)
const api = 'https://api.useapi.net/v1/tempolor'
const format = 'mp3' // or 'wav', or 'stems' for a ZIP of the separated vocals and instruments
const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

const call = async (path, init = {}) => {
  const response = await fetch(`${api}/${path}`, { headers, ...init })
  return { status: response.status, body: await response.json().catch(() => ({})) }
}

// 1. Submit. 429 means every connected account is busy: wait 30 seconds and send it again.
const body = { prompt, model_instrumental: 'i4' }
if (tonality) body.tonality = tonality
if (bpm) body.bpm = Number(bpm)
if (chords) body.chords = chords

let submit
while (true) {
  submit = await call('music/instrumental', { method: 'POST', body: JSON.stringify(body) })
  if (submit.status !== 429) break
  console.log('429, accounts busy, retrying in 30 seconds:', submit.body.error)
  await sleep(30_000)
}
if (submit.status !== 200) {
  console.error(`POST music/instrumental answered ${submit.status}:`, submit.body)
  process.exit(1)
}
const { jobs, unlimited, remainNum, totalNum } = submit.body
console.log(`Submitted ${jobs.length} track(s)`, unlimited ? '(unlimited plan)' : `(${remainNum} of ${totalNum} tracks left this month)`)

// 2. Poll each job until status_final, then 3. download it.
for (const job_id of jobs) {
  let music
  const started = Date.now()
  do {
    await sleep(10_000)
    music = await call(`music/${job_id}`)
    // A job just submitted can read as not listed by TemPolor yet for up to 10 minutes: not a failure.
    if (music.status === 404 && Date.now() - started < 10 * 60_000) continue
    if (music.status !== 200) throw new Error(`GET music answered ${music.status}: ${JSON.stringify(music.body)}`)
    console.log(job_id, music.body.status_name, `${music.body.progress ?? 0}%`)
  } while (!music.body.status_final)

  if (music.body.status_name !== 'COMPLETED') {
    console.error(job_id, 'FAILED, status', music.body.status)
    continue
  }

  // A track can read COMPLETED a few seconds before its file is ready, so a 404 here is retried.
  let download
  for (let attempt = 0; attempt < 6; attempt++) {
    download = await call(`music/download/${job_id}?file_format=${format}`)
    if (download.status === 200) break
    await sleep(10_000)
  }
  if (download.status !== 200) {
    console.error(job_id, `download answered ${download.status}:`, download.body)
    continue
  }
  const file = `${music.body.itemId ?? job_id.split('job:').pop()}.${format === 'stems' ? 'zip' : format}`
  await writeFile(file, Buffer.from(await (await fetch(download.body.url)).arrayBuffer()))
  const { style, key, bpm: tempo, dur } = music.body.musicMaterial ?? {}
  console.log(`Saved ${file}: "${music.body.titleEn}", ${style}, ${key}, ${tempo} BPM, ${dur} s`)
}
