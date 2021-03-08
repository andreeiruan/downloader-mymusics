import 'dotenv/config'
import './config/mongoConnect'

import express from 'express'
import Bullboard from 'bull-board'

import { GetLinkMusicsQueue } from './queues/GetLinkMusicsQueue'
import { DownloadConvertMusic } from './queues/DownloadConvertMusic'

import { DownloaderUseCase } from './useCase/downloaderUseCase'
import { downloaderUseCase } from './useCase'

class Application {
  public readonly app: express.Application
  private readonly downloaderUseCase: DownloaderUseCase

  constructor (downloaderUseCase: DownloaderUseCase) {
    this.app = express()
    Bullboard.setQueues(
      [GetLinkMusicsQueue.instance().queue,
        DownloadConvertMusic.instance().queue])

    this.downloaderUseCase = downloaderUseCase

    this.app.use('/admin/queue', Bullboard.UI)
    this.app.use(express.json())

    this.app.get('/downloader', async (req, res) => {
      const { token } = req.query
      const { status, data, message } = await this.downloaderUseCase.execute(String(token))

      return res.status(status).json({ message, data })
    })

    this.app.get('/clean', (req, res) => {
      try {
        GetLinkMusicsQueue.instance().clean()
        DownloadConvertMusic.instance().clean()

        return res.json({ clean: true })
      } catch (error) {
        return res.status(500).json({ message: 'Internal Server Error' })
      }
    })
  }
}

const app = new Application(downloaderUseCase).app

app.listen(5000, () => {
  console.log(('Server running in port 5000!!!'))
})
