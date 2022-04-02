const {
  buildSuccObject,
  buildErrObject,
  itemNotFound
} = require('../middleware/utils')
const { th } = require('date-fns/locale')
const modelproduts = require('../models/products')
/**
 * Builds sorting
 * @param {string} sort - field to sort from
 * @param {number} order - order for query (1,-1)
 */
const buildSort = (sort, order) => {
  const sortBy = {}
  sortBy[sort] = order
  return sortBy
}

/**
 * 
 * @param {*} result 
 */

const updateOneClient = (model, query = {}, data = {}) => new Promise((resolve, reject) => {
  model.findOneAndUpdate(query, { $set: data }, { new: true }, (errUpdate, result) => {
    if (errUpdate) {
      reject(errUpdate)
      // console.log("error",errUpdate);
    }
    if (result) {
      resolve(result)
    }
  })
})


const updateOneProduct = (model, query = {}, data = {}) => new Promise((resolve, reject) => {
  
  modelproduts.findOneAndUpdate(query, { $set: data }, { new: true }, (errUpdate, result) => {
    if (errUpdate) {
      reject(errUpdate)
    }
    if (result) {
      console.log('si guardo');
      resolve(result)
    }
  })
})



/**
 * Hack for mongoose-paginate, removes 'id' from results
 * @param {Object} result - result object
 */
const cleanPaginationID = (result) => {
  result.docs.map((element) => delete element.id)
  return result
}

/**
 * Builds initial options for query
 * @param {Object} query - query object
 */
const listInitOptions = async (req) => {
  return new Promise((resolve) => {
    const order = req.query.order || -1
    const sort = req.query.sort || 'createdAt'
    const sortBy = buildSort(sort, order)
    const page = parseInt(req.query.page, 10) || 1
    const limit = parseInt(req.query.limit, 10) || 5
    const options = {
      sort: sortBy,
      lean: true,
      page,
      limit
    }
    resolve(options)
  })
}

module.exports = {
  /**
   * Checks the query string for filtering records
   * query.filter should be the text to search (string)
   * query.fields should be the fields to search into (array)
   * @param {Object} query - query object
   */
  async checkQueryString(query) {
    return new Promise((resolve, reject) => {
      try {
        if (
          typeof query.filter !== 'undefined' &&
          typeof query.fields !== 'undefined'
        ) {
          const data = {
            $or: []
          }
          const array = []
          // Takes fields param and builds an array by splitting with ','
          const arrayFields = query.fields.split(',')
          // Adds SQL Like %word% with regex
          arrayFields.map((item) => {
            array.push({
              [item]: {
                $regex: new RegExp(query.filter, 'i')
              }
            })
          })
          // Puts array result in data
          data.$or = array
          resolve(data)
        } else {
          resolve({})
        }
      } catch (err) {
        console.log(err.message)
        reject(buildErrObject(422, 'ERROR_WITH_FILTER'))
      }
    })
  },

  /**
   * Gets items from database
   * @param {Object} req - request object
   * @param {Object} query - query object
   */
  async getItems(req, model, query) {
    const options = await listInitOptions(req)
    return new Promise((resolve, reject) => {
      model.paginate(query, options, (err, items) => {
        if (err) {
          reject(buildErrObject(422, err.message))
        }
        resolve(cleanPaginationID(items))
      })
    })
  },

  /**
   * Gets item from database by id
   * @param {string} id - item id
   */
  async getItem(id, model) {
    return new Promise((resolve, reject) => {
      model.findById(id, (err, item) => {
        itemNotFound(err, item, reject, 'NOT_FOUND')
        resolve(item)
      })
    })
  },
  async getItemespecific(id, model) {
   
    return new Promise((resolve, reject) => {
      model.findOne({ idoriginal: id }, (err, item) => {
        itemNotFound(err, item, reject, 'NOT_FOUND')
        resolve(item)
      })
      // MyModel.find({ name: 'john', age: { $gte: 18 }});

      // model.find(query,{$set:data},{new: true},(errUpdate, result)=>{
      //   if(errUpdate){
      //     reject(errUpdate)
      //       // console.log("error",errUpdate);
      //   }
      //   if(result){
      //       resolve(result)
      //   }
      // })
    })
  },
  /**
   * Creates a new item in database
   * @param {Object} req - request object
   */
  async createItem(req, model) {
    return new Promise((resolve, reject) => {
      model.create(req, (err, item) => {
        if (err) {
          reject(buildErrObject(422, err.message))
        }
        resolve(item)
      })
    })
  },
  async getRamdominterno(req, model) {
    let qq = []
    let count = parseInt(req.count);
    let type = req.identification;
    let tokens = req.tokens ? req.tokens : null ;

    // eliminar para quitar limites
    if (type == 'unique') {
      console.log('llegue a la unica');
      return new Promise((resolve, reject) => {
        // model.aggregate([{
        //   $match: {
        //     box: { $exists: false },
        //     tallaz: '43'
        //   }
        // },
        if( process.env.talla_z) {
          var arreglo = {
            box: { $exists: false },
            tallaz:  process.env.talla_z ?  process.env.talla_z : ''
          };
        } else {
          var arreglo = {
            box: { $exists: false }
          };
        }
        model.aggregate([{
          $match: arreglo
        },
        { $sample: { size: count } }],
          (err, item) => {
            if (err) {
              reject(buildErrObject(422, err.message))
            } else {
              item.forEach(user => {
                const a = updateOneClient(model, { _id: user._id }, { box: req });
                qq.push(a)
              })

              Promise.all(qq).then(p => resolve(true))
            }

          })
      })
    } if( type == 'nft' || type == 'nftProduct') {

  
      return new Promise((resolve, reject) => {
        model.aggregate([{ $match: { box: { $exists: false } } }, { $sample: { size: count } }], (err, item) => {
          if (err) {
            reject(buildErrObject(422, err.message))
          } else {
            item.forEach((user, i) => {
               
              if(tokens.length > 0) {
                if(req.tokens[i].status == 'available') { 
                  
                  req.nftToken = req.tokens[i].value;
                 
                  tokens[i].status = 'used';
                  tokens[i].id_used = user._id;
                  const a = updateOneClient(model, { _id: user._id }, { box: req, nftToken: req.tokens[i].value });
              
                  qq.push(a)
                }
               
              }
            })
            Promise.all(qq).then(p => {
              const b = updateOneProduct(model, { _id: req._id }, { tokens: tokens });
              resolve(true)
            } )
          }

        })
      })
    } else {
     
      return new Promise((resolve, reject) => {
        model.aggregate([{ $match: { box: { $exists: false } } }, { $sample: { size: count } }], (err, item) => {
          if (err) {
            reject(buildErrObject(422, err.message))
          } else {
           
            item.forEach(user => {
              console.log(user.name, count, '---');
              const a = updateOneClient(model, { _id: user._id }, { box: req });
              qq.push(a)
            })

            Promise.all(qq).then(p => resolve(true))
          }

        })
      })
    }

  },

  async getRamdom(req, model) {

    ramdons = []
    ramdons2 = []

    return new Promise((resolve, reject) => {
      // req.forEach(async element => {
      //   const a = await this.getRamdominterno(element, model);
      //   ramdons.push(a);
      // })
      this.getRamdominterno(req[0], model).then(next => {
        if (req[1]) {
          this.getRamdominterno(req[1], model).then(next2 => {
            if (req[2]) {
              this.getRamdominterno(req[2], model).then(next3 => {
                if (req[3]) {
                  this.getRamdominterno(req[3], model).then(next4 => {
                    if (req[4]) {
                      this.getRamdominterno(req[4], model).then(next5 => {
                        if (req[5]) {
                          console.log("llgue");
                          this.getRamdominterno(req[5], model).then(next6 => {
                            resolve(true);
                          });
                        }
                      });
                    }
                  });
                }
              });
            }
          });
        } else {
          resolve(true);
        }
      })
      // borrable
      // const a =  this.getRamdominterno(req[0], model);
      // ramdons.push(a);
      // // fin del borrable

      // Promise.all(ramdons).then( o => {
      //   // borrable
      //   if(req[1]) {
      //     const b =  this.getRamdominterno(req[1], model);
      //     ramdons2.push(b);
      //   }

      //   // if(req[3]) {
      //   //   const d =  this.getRamdominterno(req[3], model);
      //   // }
      //  // fin del borrable
      //   console.log('YA TERMINE la primera vuelta') 
      // }).then(p => resolve(true))


      // Promise.all(ramdons2).then( o => {
      //   if(req[2]) {
      //     this.away1(req[2], model, req[3]);
      //    // const c =  this.getRamdominterno(req[2], model);
      //    // ramdons3.push(c);
      //   }
      // }).then(p => resolve(true))


      // Promise.all(ramdons3).then( o => {
      //   if(req[3]) {
      //     console.log('llegue a 3' , req[3]);
      //     const d =  this.getRamdominterno(req[3], model);

      //   }
      // }).then(p => resolve(true))



    })


  },


  /**
   * Updates an item in database by id
   * @param {string} id - item id
   * @param {Object} req - request object
   */
  async updateItem(id, model, req) {

    return new Promise((resolve, reject) => {
      model.findByIdAndUpdate(
        id,
        req,
        {
          new: true,
          runValidators: true
        },
        (err, item) => {
          itemNotFound(err, item, reject, 'NOT_FOUND')
          resolve(item)
        }
      )
    })
  },

  /**
   * Deletes an item from database by id
   * @param {string} id - id of item
   */
  async deleteItem(id, model) {
    return new Promise((resolve, reject) => {
      model.findByIdAndRemove(id, (err, item) => {
        itemNotFound(err, item, reject, 'NOT_FOUND')
        resolve(buildSuccObject('DELETED'))
      })
    })
  }
}
