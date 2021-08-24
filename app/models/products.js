const mongoose = require('mongoose')
const mongoosePaginate = require('mongoose-paginate-v2')


const ProductsSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    description: {
      type: String,
    },
    identification: {
      type: String,
      required: true
    },
    count: {
      type: Number,
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    custom_data: {
      type: Object,
    },
    type_product: {
      type: String,
    },
    tokens: {
      type: Object,
    },
  },
  {
    versionKey: false,
    timestamps: true
  }
)

ProductsSchema.plugin(mongoosePaginate)
module.exports = mongoose.model('Products', ProductsSchema)
