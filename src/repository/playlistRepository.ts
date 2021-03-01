import { Model } from 'mongoose'
import { Playlist, PlaylistDocument } from '../schemas/Playlist'

export class PlaylistRepository {
  private readonly playlists: Model<any>

  constructor (playlists: Model<any>) {
    this.playlists = playlists
  }

  async findOrCreate (playlist: Playlist): Promise<PlaylistDocument> {
    let playlistExists = await this.playlists.findOne({
      $and: [
        { name: playlist.name },
        { idSpotify: playlist.idSpotify }
      ]
    })

    if (!playlistExists) {
      playlistExists = await this.playlists.create({ ...playlist })
    }

    return playlistExists
  }
}
