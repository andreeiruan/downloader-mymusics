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

    this.api.interceptors.request.use(req => {
      req.headers.Authorization = `Bearer ${process.env.TOKEN}`
      return req
    })
  }

  async getPlaylists (): Promise<Playlist[]> {
    const { data, status } = await this.api.get('/me/playlists')

    if (status !== 200) {
      throw new Error('Unauthorized')
    }
    if (data.items) {
      const playlists = data.items.map((p: any) => ({
        idSpotify: p.id,
        name: p.name,
        length: p.tracks.total
      }))
      // Armazenar cada plyslits no db
      return playlists
    }

    return []
  }

  async getMusicsInPlaylist (playlist: Playlist): Promise<Music[]> {
    const { data } = await this.api.get(`/playlists/${playlist.idSpotify}/tracks`)

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
        const { data } = await this.api.get(`/playlists/${playlist.idSpotify}/tracks`, { params: { offset } })
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

    // Armazenar cada musica no db
    return musics
  }
}
