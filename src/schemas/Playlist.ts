import { Schema, model, Document } from 'mongoose'

export type Playlist = {
  idSpotify: string
  name: string
  length: number
}

export type PlaylistDocument = Playlist & Document

export const PlaylistSchema = new Schema({
  idSpotify: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
    unique: true
  },
  length: {
    type: Number,
    required: true
  }
})

export default model('Playlist', PlaylistSchema)
