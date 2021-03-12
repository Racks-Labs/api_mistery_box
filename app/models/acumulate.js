const mongoose = require('mongoose')
const mongoosePaginate = require('mongoose-paginate-v2')


const AcumulateSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    tax: {
      type: Number,
      required: true
    },
    createdOn: {
      type: Date,
      required: false
    },
    modifiedOn: {
      type: Date,
      required: false
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

AcumulateSchema.plugin(mongoosePaginate)
module.exports = mongoose.model('Acumulate', AcumulateSchema)
