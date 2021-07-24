const mongoose = require('mongoose')
const mongoosePaginate = require('mongoose-paginate-v2')


const SettingSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    date_init: {
      type: String,
    },
    date_finish: {
      type: String,
      required: true
    },
    date_start: {
      type: String,
    },
    hour: {
      type: String,
    },
    custom_data: {
      type: Object,
    },
  },
  {
    versionKey: false,
    timestamps: true
  }
)

SettingSchema.plugin(mongoosePaginate)
module.exports = mongoose.model('Setting', SettingSchema)
