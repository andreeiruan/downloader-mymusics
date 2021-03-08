import Bull, { Job, JobOptions } from 'bull'
import { VideoUtilities } from '../helpers/videoUtilities'
import { redisConfig } from '../config/redis'
import MusicSchema from '../schemas/Music'
import { MusicRepository } from '../repository/musicRepository'

export class DownloadConvertMusic {
  private static _instance: DownloadConvertMusic | null = null
  queue: Bull.Queue
  musicRepository: MusicRepository

  private constructor () {
    this.queue = new Bull('DownloadConvertMusic', {
      redis: redisConfig,
      limiter: {
        max: 10,
        duration: 15000
      }
    })
  }

  static instance () {
    if (DownloadConvertMusic._instance === null) {
      DownloadConvertMusic._instance = new DownloadConvertMusic()
    }

    return DownloadConvertMusic._instance
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
    const { music } = job.data

    if (!music.completed) {
      const musicRepository = new MusicRepository(MusicSchema)
      await VideoUtilities.downloader(music)

      await musicRepository.confirmCompleted(music)
    }
  }
}
