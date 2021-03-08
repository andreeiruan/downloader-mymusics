import axios, { AxiosInstance } from 'axios'
import { Music } from '../schemas/Music'
import { Playlist } from '../schemas/Playlist'

export class SpotifyService {
  private readonly api: AxiosInstance

  constructor () {
    this.api = axios.create({
      baseURL: 'https://api.spotify.com/v1',
      validateStatus: (status) => status < 500
    })
  }

  async getPlaylists (token: string): Promise<Playlist[]> {
    const { data, status } = await this.api.get('/me/playlists', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    if (status !== 200) {
      throw new Error('Unauthorized')
    }
    if (data.items) {
      const playlists = data.items.map((p: any) => ({
        idSpotify: p.id,
        name: p.name,
        length: p.tracks.total
      }))

      return playlists
    }

    return []
  }

  async getMusicsInPlaylist (playlist: Playlist, token: string): Promise<Music[]> {
    const { data } = await this.api.get(`/playlists/${playlist.idSpotify}/tracks`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    const musics: Music[] = []
    if (data.items) {
      const musicsApiResponse = data.items.map((i: any) => ({
        name: i.track.name,
        artist: i.track.artists[0].name,
        completed: false,
        playlistId: playlist.idSpotify,
        playlistName: playlist.name
      }))

      musics.push(...musicsApiResponse)
    }

    if (data.total > 100) {
      let offset = 100
      while (offset <= data.total) {
        const { data } = await this.api.get(`/playlists/${playlist.idSpotify}/tracks`, {
          params: { offset },
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        const musicsApiResponse = data.items.map((i: any) => ({
          name: i.track.name,
          artist: i.track.artists[0].name,
          completed: false,
          playlistId: playlist.idSpotify,
          playlistName: playlist.name
        }))
        musics.push(...musicsApiResponse)

        offset += 100
      }
    }

    return musics
  }
}
