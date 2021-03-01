import { SpotifyService } from '../helpers/spotify'
import { MusicRepository } from '../repository/musicRepository'
import { PlaylistRepository } from '../repository/playlistRepository'
import MusicSchema from '../schemas/Music'
import PlaylistSchema from '../schemas/Playlist'
import { DownloaderUseCase } from './downloaderUseCase'

const spotifySvc = new SpotifyService()
const playlistRepository = new PlaylistRepository(PlaylistSchema)
const musicRespository = new MusicRepository(MusicSchema)

export const downloaderUseCase = new DownloaderUseCase(spotifySvc, playlistRepository, musicRespository)
