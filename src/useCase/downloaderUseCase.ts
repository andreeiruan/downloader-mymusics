import { MusicRepository } from '../repository/musicRepository'
import { SpotifyService } from '../helpers/spotify'
import { PlaylistRepository } from '../repository/playlistRepository'
import { GetLinkMusicsQueue } from '../queues/GetLinkMusicsQueue'
import { Music, MusicDocument } from '../schemas/Music'

interface HttpResponse {
  status: number
  message: string
  data?: any
}

export class DownloaderUseCase {
  private readonly spotifySvc: SpotifyService
  private readonly playlistRepository: PlaylistRepository
  private readonly musicRepository: MusicRepository

  constructor (spotifySvc: SpotifyService,
    playlistRepository: PlaylistRepository, musicRepository: MusicRepository) {
    this.spotifySvc = spotifySvc
    this.playlistRepository = playlistRepository
    this.musicRepository = musicRepository
  }

  async partitionsMusicList (musics: Music[]): Promise<Music[][]> {
    const incompletedMusics = musics.filter(m => {
      if (!m.completed) {
        return m
      }

      return null
    })

    let i = 0
    const parts = []
    do {
      const partMusics = incompletedMusics.slice(i, i + 100)
      i += 100
      parts.push(partMusics)
    } while (i <= incompletedMusics.length)

    return parts
  }

  async execute (): Promise<HttpResponse> {
    try {
      const playlists = await this.spotifySvc.getPlaylists()

      const musics: MusicDocument[] = []

      for (const p of playlists) {
        const playlist = await this.playlistRepository.findOrCreate(p)

        const musicsInPlaylist = await this.spotifySvc.getMusicsInPlaylist(playlist)

        const m = await Promise.all(musicsInPlaylist.map(async m => {
          const music = await this.musicRepository.findOrCreate(m)
          return music
        }))

        musics.push(...m)
      }

      const parts = await this.partitionsMusicList(musics)
      parts.forEach(musics => {
        GetLinkMusicsQueue.instance().add({ musics })
      })

      return {
        status: 200,
        message: 'success',
        data: {
          musics: parts,
          lenghtParts: parts.length
        }
      }
    } catch (error) {
      if (error.message === 'Unauthorized') {
        return {
          status: 401,
          message: 'Unauthorized'
        }
      }

      return {
        status: 500,
        message: 'Internal Server Error'
      }
    }
  }
}
