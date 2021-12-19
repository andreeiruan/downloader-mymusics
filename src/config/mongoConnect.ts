import { connect } from 'mongoose'

export default connect(`mongodb://admin:admin@${process.env.MONGO_HOST}`, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: true,
  useCreateIndex: true
})
