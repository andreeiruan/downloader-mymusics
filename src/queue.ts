import 'dotenv/config'
import './config/mongoConnect'

import cluster from 'cluster'
import os from 'os'

import { GetLinkMusicsQueue } from './queues/GetLinkMusicsQueue'
import { DownloadConvertMusic } from './queues/DownloadConvertMusic'

if (cluster.isMaster) {
  for (let i = 0; i < os.cpus().length; i++) {
    cluster.fork()
  }

  cluster.on('exit', () => {
    cluster.fork()
  })
} else {
  GetLinkMusicsQueue.instance().process()
  DownloadConvertMusic.instance().process()
}
