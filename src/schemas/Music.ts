import { Schema, Document, model } from 'mongoose'

export type Music = {
  artist: string
  name: string
  completed: boolean
  playlistId: string
  playlistName: string
  link?: string
}

export type MusicDocument = Music & Document

export const MusicSchema = new Schema({
  artist: {
    type: String,
    required: false
  },
  name: {
    type: String,
    required: true
  },
  completed: {
    type: Boolean,
    required: true
  },
  link: {
    type: String,
    required: false
  },
  playlistId: {
    type: String,
    required: true
  },
  playlistName: {
    type: String,
    required: true
  }
})

export default model('Music', MusicSchema)
