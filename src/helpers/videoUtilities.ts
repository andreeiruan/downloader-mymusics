import fs from 'fs'
import path from 'path'
import ytdl from 'ytdl-core'
import ffmpegStatic from 'ffmpeg-static'
import videoConverter from 'video-converter'
import { Music } from '../schemas/Music'

export class VideoUtilities {
  static readonly dirMusics = path.resolve(__dirname, '..', '..', 'temp', 'musics')
  static readonly dirVideos = path.resolve(__dirname, '..', '..', 'temp', 'videos')

  static formatName (name: string): string {
    const newName = name.split(' ').join('').replace(/[^A-Z^a-z^0-9ÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑáàâãéèêíïóôõöúçñ]/g, '')
    return newName
  }

  static async converter (music: Music, playlistName: string): Promise<void> {
    videoConverter.setFfmpegPath(ffmpegStatic, (err) => {
      if (err) throw err
    })
    return new Promise((resolve, reject) => {
      const dir = `${this.dirMusics}/${this.formatName(playlistName)}`

      if (!fs.existsSync(this.dirMusics)) {
        fs.mkdirSync(this.dirMusics)
      }

      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir)
      }
      videoConverter.convert(
        `${this.dirVideos}/${this.formatName(playlistName)}/${this.formatName(music.name)}.mp4`,
        `${dir}/${this.formatName(music.artist)}_${this.formatName(music.name)}.mp3`,
        (err) => {
          if (err) return reject(err)
          fs.unlinkSync(`${this.dirVideos}/${this.formatName(playlistName)}/${this.formatName(music.name)}.mp4`)
          return resolve()
        }
      )
    })
  }

  static async downloader (music: Music): Promise<void> {
    const dir = `${this.dirVideos}/${this.formatName(music.playlistName)}`

    if (!fs.existsSync(this.dirVideos)) {
      fs.mkdirSync(this.dirVideos)
    }

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir)
    }

    return new Promise((resolve, reject) => {
      if (!music.link) {
        return reject(new Error('Missing link'))
      }

      ytdl(`https://www.youtube.com${music.link}`, { quality: 'highestaudio' })
        .on('error', (err) => {
          return reject(err)
        })
        .pipe(
          fs.createWriteStream(`${this.dirVideos}/${this.formatName(music.playlistName)}/${this.formatName(music.name)}.mp4`, {
            emitClose: true
          })
            .on('close', async () => {
              await this.converter(music, music.playlistName)

              return resolve()
            })
        )
    })
  }
}
