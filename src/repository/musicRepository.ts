import { Model } from 'mongoose'
import { Music, MusicDocument } from '../schemas/Music'

export class MusicRepository {
  private readonly musics: Model<any>

  constructor (musics: Model<any>) {
    this.musics = musics
  }

  async findOrCreate (music: Music): Promise<MusicDocument> {
    let musicExists = await this.musics.findOne({
      $and: [
        { name: music.name },
        { playlistId: music.playlistId }
      ]
    })

    if (!musicExists) {
      musicExists = await this.musics.create({ ...music })
    }

    return musicExists
  }

  async findIncompletedMusics (): Promise<MusicDocument[]> {
    const musics = await this.musics.find({
      completed: false
    })

    return musics
  }

  async updateLink (music: Music, link: string): Promise<MusicDocument> {
    await this.musics.updateOne({
      $and: [
        { name: music.name },
        { playlistId: music.playlistId }
      ]
    }, {
      link
    })

    const musicUpdated = await this.musics.findOne({
      $and: [
        { name: music.name },
        { playlistId: music.playlistId }
      ]
    })

    return musicUpdated
  }

  async confirmCompleted (music: Music): Promise<void> {
    await this.musics.updateOne({
      $and: [
        { name: music.name },
        { playlistId: music.playlistId }
      ]
    }, {
      completed: true
    })
  }
}
