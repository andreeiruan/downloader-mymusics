import Bull, { Job, JobOptions } from 'bull'
import puppeteer from 'puppeteer'

import { redisConfig } from '../config/redis'

import MusicSchema from '../schemas/Music'
import { MusicRepository } from '../repository/musicRepository'
import { DownloadConvertMusic } from './DownloadConvertMusic'

export class GetLinkMusicsQueue {
  private static _instance: GetLinkMusicsQueue | null = null
  queue: Bull.Queue

  private constructor () {
    this.queue = new Bull('GetLinkMusicsQueue', {
      redis: redisConfig,
      limiter: { max: 1, duration: 200000 }
    })
  }

  static instance () {
    if (GetLinkMusicsQueue._instance === null) {
      GetLinkMusicsQueue._instance = new GetLinkMusicsQueue()
    }

    return GetLinkMusicsQueue._instance
  }

  add (data: any, opts?: JobOptions) {
    return this.queue.add(data, opts)
  }

  process () {
    this.queue.process(this.handle)
  }

  clean () {
    this.queue.clean(2000, 'active')
    this.queue.clean(2000, 'wait')
    this.queue.clean(2000, 'completed')
  }

  async handle (job: Job): Promise<any> {
    const { musics } = job.data

    const musicRepository = new MusicRepository(MusicSchema)

    const browser = await puppeteer.launch()
    const page = await browser.newPage()

    for (let i = 0; i <= musics.length - 1; i++) {
      if (musics[i].link) {
        DownloadConvertMusic.instance().add({ music: musics[i] })
      } else {
        const name = musics[i].name
        const artist = musics[i].artist
        const searchText = `${name.split(' ').join('+')}+${artist.split(' ').join('+')}+audio`
        await page.goto(`https://www.youtube.com/results?search_query=${searchText}`)

        const link = await page.evaluate(() => {
          const linkElement = document.getElementById('thumbnail')
          if (linkElement) {
            return linkElement.getAttribute('href')
          }
          return undefined
        })

          const regex = new RegExp(/^\/watch\?v/gm) // eslint-disable-line

        if (link && regex.test(link)) {
          const musicUpdated = await musicRepository.updateLink(musics[i], link)
          DownloadConvertMusic.instance().add({ music: musicUpdated })
        }
      }

      job.progress(i * 100 / musics.length)
    }

    await browser.close()
  }
}
