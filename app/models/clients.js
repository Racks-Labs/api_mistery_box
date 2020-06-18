const mongoose = require('mongoose')
const mongoosePaginate = require('mongoose-paginate-v2')


const ClientsSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },

    email: {
      type: String,
    },
    idoriginal: {
      type: String,
      required: true
    },
    custom_data: {
      type: String,
    },
    box: {
      type: Object,
    },
    tallas: {
      type: Object,
    },
    tallaz: {
      type: String,
    }
  },
  {
    versionKey: false,
    timestamps: true
  }
)

ClientsSchema.plugin(mongoosePaginate)
module.exports = mongoose.model('Client', ClientsSchema)
