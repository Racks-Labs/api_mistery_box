const model = require('../models/clients')
const modelacumulate = require('../models/acumulate')
const modelproduts = require('../models/products')
const { matchedData } = require('express-validator')
const utils = require('../middleware/utils')
const db = require('../middleware/db')
const multer = require('multer')
const fs = require('fs')
const csv = require('csv-parse')
const axios = require('axios')
const { exit } = require('process')
const { isValidObjectId } = require('mongoose')
const moment = require('moment');
/*********************
 * Private functions *
 *********************/

const parseFile = (file) => {
  let clients = []
  let vueltas = 0
  let cabezera = []
  const { path } = file
  // const routefile = file.path;
  fs.createReadStream(path) // Abrir archivo
    .pipe(csv()) // Pasarlo al parseador a través de una tubería
    .on('data', function (data) {
      try {
        custom_data = []
        vueltas = vueltas + 1
        if (vueltas == 1) {
          cabezera = data
        } else {
          data.forEach((element, index) => {
            // console.log(index, element)
            custom_data.push(`${cabezera[index]} : ${element}`)
          })
          clients.push({
            name: data[24],
            email: data[1],
            idoriginal: data[0],
            custom_data: JSON.stringify(custom_data)
          })
        }
      }
      catch (err) {
        //error handler
      }
    })
    .on('end', function () {
      clients.forEach(async (user) => {
        const doesUserExists = await cityExists(user.idoriginal);
        if (!doesUserExists || null) {
          console.log(doesUserExists);
          model.create(user, (err, item) => {
            if (err) {
              console.log('---->', err)
            }
          })
        }
      })
      return (true);
      // console.log(clients.find(a => true))
      console.log('Termine')
    })
}
/**
 *
 * @type {DiskStorage}
 */
// inicio de lo nuevo

exports.GetDataAmountScuare = (req, res) => new Promise(async (resolve, reject) => {
  try {

    let arreglodata = [];
    let manana = moment().add(1, 'days').toISOString();
    let semana = moment().add(-7, 'days').toISOString();
    console.log(manana, semana);
    //  let url = 'https://api.squarespace.com/1.0/commerce/transactions?modifiedAfter=2021-01-02T01:00:00Z&modifiedBefore=2021-03-03T23:00:00Z';
    let url = 'https://api.squarespace.com/1.0/commerce/transactions?modifiedAfter=' + semana + '&modifiedBefore=' + manana
    console.log(url);
    let data = await extractaxiosAmount(url).then(ress => {

      res.status(200).json(ress)

    });


  } catch (ex) {
    reject(ex)
  }
})


const extractaxiosAmount = async (url = null) => {
  return new Promise(async (resolve, reject) => {
    try {
      //  req = matchedData(req)
      let baseURL = url;
      let token = process.env.TOKENSCURARE;
      // import qs from 'qs';
      const data = { 'bar': 123 };
      const options = {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` },
        // data: qs.stringify(data),
        baseURL,
      };
      const req = await axios(options);

      let totalasienda = 0;
      let totalsum = 0;
      let client = null;
      let modifi = false;


      const id = await utils.isIDGood('60493cefe430a51c94d88d5f')

      modelacumulate.findById(id, (err, item) => {
        let datacomplete = item;
        ultimoid = datacomplete.id;
        totalsum = parseFloat(datacomplete.amount).toFixed(2);
        totalasienda = parseFloat(datacomplete.tax).toFixed(2);
        let status = true;
        if (req.data.documents.length > 0) {
          var bar = new Promise((resolve, reject) => {

            req.data.documents.some((element, index, array) => {

              if (element.id != ultimoid) {
                if (req.data.documents[0].id == element.id) {
                  client = {
                    id: element.id,
                    salesOrderId: element.salesOrderId,
                    createdOn: element.createdOn,
                    modifiedOn: element.modifiedOn,
                    totalTaxes: element.totalTaxes.value,
                    totalSales: element.totalSales.value,
                    totalNetShipping: element.totalNetShipping.value,
                    total: element.total.value,
                    customerEmail: element.customerEmail
                  };
                  modifi = true;
                }
                if (status) {

                  totalsum = parseFloat(element.total.value) + parseFloat(totalsum);
                  totalasienda = parseFloat(element.totalTaxes.value) + parseFloat(totalasienda);
                }
              } else {
                status = false;
              }
              if (index === array.length - 1) resolve();
            });
          });

          bar.then(() => {
            status = false;
            let totales = {
              total: parseFloat(totalsum).toFixed(2),
              tax: parseFloat(totalasienda).toFixed(2)
            }
            if (modifi) {
              let data = {
                id: client.id,
                tax: parseFloat(totalasienda).toFixed(2),
                amount: parseFloat(totalsum).toFixed(2),
                custom_data: client,
                createdOn: client.createdOn,
                modifiedOn: client.modifiedOn
              }

              db.updateItem(id, modelacumulate, data);
              // modelacumulate.create(data, (err, item) => {
              //   if (err) {
              //     console.log('---->', err)
              //   } else {
              //     console.log('---->', item)
              //   }
              // })

              console.log(totales, 'sumando');
              resolve(totales);
            } else {
              console.log(totales, 'sin sumar');
              resolve(totales);

            }
          });

        }
      });

      // const query = { "name": "lego" };
      // // Set some fields in that document
      // const update = {
      //   "$set": {
      //     "name": "blocks",
      //     "price": 20.99,
      //     "category": "toys"
      //   }
      // };
      // // Return the updated document instead of the original document
      // const options = { returnNewDocument: true };
      // return itemsCollection.findOneAndUpdate(query, update, options)





      // if (req.data.pagination.hasNextPage) {
      //   url = req.data.pagination.nextPageUrl
      //   await extractaxios(url);
      // } else {
      //   // res.status(200).json(await 'correcto')
      //   // return 'arreglodata';
      //   return 'completado';
      // }


    } catch (error) {
      reject(error);
      utils.handleError(res, error)
    }

  })

}



const existultimo = async (name) => {

  return new Promise((resolve, reject) => {
    modelacumulate.findOne(
      {
        id: name
      },
      (err, item) => {
        console.log(err, item);
        if (err) {
          reject(utils.buildErrObject(422, 'no_exist_order_client'))
        } else {
          resolve(item)
        }
        // utils.itemAlreadyExists(err, item, reject, 'ORDER_CLIENT_ALREADY_EXISTS')
      }
    )
  })
}

// fin de lo nuevo






exports.GetDataApsquarespace = (req, res) => new Promise(async (resolve, reject) => {
  try {

    req = matchedData(req);
  
    let date_init = req.date_init ?  JSON.parse(req.date_init) : moment().format("YYYY-MM-01").toString(); ;
    let date_finish = req.date_finish ? JSON.parse(req.date_finish) :  moment().format("YYYY-MM-") + moment().daysInMonth().toString(); 
  
    
    let arreglodata = [];
    // let url = `https://api.squarespace.com/1.0/commerce/orders?modifiedAfter=${date_init}&modifiedBefore=${date_finish}`;
   
    // console.log('https://api.squarespace.com/1.0/commerce/orders?modifiedAfter=2021-06-03T01:00:00Z&modifiedBefore=2021-07-02T23:00:00Z', 'url2');
    // let dataOne = await extractaxios(url);
  

    let date_init_ = moment(req.date_init,  'YYYY-MM-DD').format('YYYY-MM-DD').toString();
    let date_finish_ = moment(req.date_finish, 'YYYY-MM-DD').format('YYYY-MM-DD').toString();



    let data = await extractaxiosShopy(null, null, date_init_, date_finish_);
    res.status(200).json(await 'termino')
  } catch (ex) {
    reject(ex)
  }
})

// shopofy

const extractaxiosShopy = async (url = null, nexttoken = null, date_init_ = null,  date_finish_ = null) => {
  try {
    //  req = matchedData(req)
    let baseURL = null;
    if(nexttoken) {
      baseURL = `https://racksmafia.myshopify.com/admin/api/2021-07/orders.json?limit=250&page_info=${nexttoken}; rel="next"`;
      console.log('seugundo', baseURL);
    } else {
      baseURL = `https://racksmafia.myshopify.com/admin/api/2021-07/orders.json?limit=250&created_at_min=${date_init_}&created_at_max=${date_finish_}&status=any&financial_status=paid`;
    }

    // let baseURL = url;
    let token =  process.env.TOKENSHOPIFY;
    // import qs from 'qs';
    const data = { 'bar': 123 };
    const options = {
      method: 'GET',
      headers: { 'X-Shopify-Access-Token':  token,
                  'Content-Type' : 'application/json'
    },
      // data: qs.stringify(data),
      baseURL,
    };
    const req = await axios(options);
  
   
   
    if (req.data.orders.length > 0) {
      req.data.orders.forEach(async element => {
        let talla = null;
        let camiseta = null;
        if(element.line_items[0].variant_title) {
          let tallaP = element.line_items[0].variant_title.split('/');
          talla = tallaP[0];
          camiseta = tallaP[1];
        }
        // console.log('fecha', element.created_at);
        let client = {
          name: element.customer.first_name,
          email: element.customer.email,
          idoriginal: element.id,
          iclient: element.customer.id,
          tallas: camiseta ? camiseta : 'xs' ,
          tallaz: talla ? talla : 0,
          custom_data: JSON.stringify(element),
          dateRegister: element.created_at
        };

       
        if(element.line_items.length > 1 ) {
          element.line_items.forEach(async elementF => {
            if(elementF.product_id == 6655717474468 || elementF.id == '10396736946340') {
              if (element.financial_status === 'paid') {
                console.log( element.customer.email, element.created_at,element.customer.first_name );
                const doesUserExists = await cityExists(client.idoriginal);
                if (!doesUserExists || null) {
                  model.create(client, (err, item) => {
                    if (err) {
                      console.log('---->', err)
                    }
                  })
                }
              }
            
            }
          });
        } else {
          if(element.line_items[0].product_id == 6655717474468) {
             if (element.financial_status === 'paid' && (element.line_items[0].id == '10396736946340' || element.line_items[0].product_id == '6655717474468')) {
              console.log( element.customer.email, element.created_at );
                const doesUserExists = await cityExists(client.idoriginal);
                console.log( element.customer.email);
                if (!doesUserExists || null) {
                  model.create(client, (err, item) => {
                    if (err) {
                      console.log('---->', err)
                    }
                  })
                }
              }
           
          }
        }
      
        // if (element.financial_status === 'paid' && (element.line_items[0].id == '10396736946340' || element.line_items[0].product_id == '6655717474468')) {
        //   const doesUserExists = await cityExists(client.idoriginal);
        //   if (!doesUserExists || null) {
        
        //     model.create(client, (err, item) => {
        //       if (err) {
        //         console.log('---->', err)
        //       }
        //     })
        //   }
        // }
      });
     
    }
    const restp = getPaging(req);
    if(restp.next) {
      let nexturl = restp.next;
      // url = req.data.pagination.nextPageUrl
      await extractaxiosShopy(null, nexturl, date_init_, date_finish_);
    } else {
      return 'completado';
    }
    
    
      // res.status(200).json(await 'correcto')
      // return 'arreglodata';
      // return 'completado';
  } catch (error) {
    console.log(error)
    // utils.handleError(res, error)
  }
}
const CURSOR_REGEX = /page_info=([^>]+)>; rel="([^"]+)/g;

function getPaging(response) {
  const paging = {};
  if (response.headers.link) {
    let match;
    while ((match = CURSOR_REGEX.exec(response.headers.link)) !== null) {
      // match[2] is "next" or "previous"
      // match[1] is the cursor (page_info)
      paging[match[2]] = match[1];
    }
  }
  // returns {next: 'the next cursor', previous: 'the previous cursor'}
  return paging;
}

let arreglodata = [];
const extractaxios = async (url = null) => {
  try {
    //  req = matchedData(req)
    let baseURL = url;
    let token = process.env.TOKENSCURARE;
    // import qs from 'qs';
    const data = { 'bar': 123 };
    const options = {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
      // data: qs.stringify(data),
      baseURL,
    };
    const req = await axios(options);
    if (req.data.result.length > 0) {
      req.data.result.forEach(async element => {

        let talla = null;
        if (element.lineItems[0].customizations) {
          if (element.lineItems[0].customizations[1].label == 'Talla de Zapatilla') {
            talla = element.lineItems[0].customizations[1].value;
          }
        }
        console.log('fecha',  element.createdOn);
        let client = {
          name: element.billingAddress.firstName,
          email: element.customerEmail,
          idoriginal: element.orderNumber,
          tallas: element.lineItems[0].customizations,
          tallaz: talla ? talla : 0,
          custom_data: JSON.stringify(element),
          dateRegister: element.createdOn
        };
        if (element.fulfillmentStatus === 'PENDING' && (element.lineItems[0].productId == '5ee3c9e61d2043132abe6285' || element.lineItems[0].productId == '5ee3ca908232ad6bff4c602b')) {
          const doesUserExists = await cityExists(client.idoriginal);
          if (!doesUserExists || null) {
            model.create(client, (err, item) => {
              if (err) {
                console.log('---->', err)
              }
            })
          }
        }
      });
    }
    if (req.data.pagination.hasNextPage) {
      url = req.data.pagination.nextPageUrl
      await extractaxios(url);
    } else {
      // res.status(200).json(await 'correcto')
      // return 'arreglodata';
      return 'completado';
    }
  } catch (error) {
    utils.handleError( error)
  }
}


const storage = multer.diskStorage({

  destination(req, file, cb) {
    cb(null, './public/media/')
  },
  filename(req, file, cb) {
    console.log(file)
    cb(null, `original_${file.originalname}`)
  }
})

exports.upload = multer({ storage })

const parseador = csv({
  delimiter: ',',//Delimitador, por defecto es la coma ,
  cast: true, // Intentar convertir las cadenas a tipos nativos
  comment: '#' // El carácter con el que comienzan las líneas de los comentarios, en caso de existir
})

parseador.on('error', function (err) {
  console.error('Error al leer CSV:', err.message)
})

exports.uploadExcel = async (req, res) => {
  try {
    let resp = parseFile(req.file)
    // req = matchedData(req)
    res.status(200).json(await 'correcto')
  } catch (error) {
    utils.handleError(res, error)
  }
}



/**
 * Checks if a city already exists excluding itself
 * @param {string} id - id of item
 * @param {string} name - name of item
 */
const cityExistsExcludingItself = async (id, name) => {
  return new Promise((resolve, reject) => {
    model.findOne(
      {
        name,
        _id: {
          $ne: id
        }
      },
      (err, item) => {
        utils.itemAlreadyExists(err, item, reject, 'CITY_ALREADY_EXISTS')
        resolve(false)
      }
    )
  })
}

/**
 * Checks if a city already exists in database
 * @param {string} name - name of item
 */
const cityExists = async (name) => {

  return new Promise((resolve, reject) => {
    model.findOne(
      {
        idoriginal: name
      },
      (err, item) => {
        if (err) {
          reject(utils.buildErrObject(422, 'no_exist_order_client'))
        } else {
          resolve(item)
        }
        // utils.itemAlreadyExists(err, item, reject, 'ORDER_CLIENT_ALREADY_EXISTS')
      }
    )
  })
}

/**
 * Gets all items from database
 */
const getAllItemsFromDB = async () => {
  return new Promise((resolve, reject) => {
    model.find(
      {},
      '-updatedAt -createdAt',
      {
        sort: {
          name: 1
        }
      },
      (err, items) => {
        if (err) {
          reject(utils.buildErrObject(422, err.message))
        }
        resolve(items)
      }
    )
  })
}

/********************
 * Public functions *
 ********************/

/**
 * Get all items function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
exports.getAllItems = async (req, res) => {
  try {
    res.status(200).json(await getAllItemsFromDB())
  } catch (error) {
    utils.handleError(res, error)
  }
}

/**
 * Get items function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
exports.getItems = async (req, res) => {
  try {
    const query = await db.checkQueryString(req.query)
    console.log('otherquer', query);
    res.status(200).json(await db.getItems(req, model, query))
  } catch (error) {
    utils.handleError(res, error)
  }
}



/**
 * Gets all items from database
 */
 const getAllItemsRangueFromDB = async (date_init, date_finish) => {
 
  return new Promise((resolve, reject) => {
    model.find({
      dateRegister: {
          $gte: date_init,
          $lt: date_finish
      }},
      (err, items) => {
        if (err) {
          reject(utils.buildErrObject(422, err.message))
        }
        resolve(items)
      }
      )
  })
}

exports.getItemsRangue = async (req, res) => {
  try {
      
    
    reqm = matchedData(req);

 
    
    let date_init = reqm.date_init ?  JSON.parse(reqm.date_init) : moment().format("YYYY-MM-01").toString(); 
    let date_finish = reqm.date_finish ? JSON.parse(reqm.date_finish) :  moment().format("YYYY-MM-") + moment().daysInMonth().toString(); 
    
    
    let start =  moment(JSON.parse(reqm.date_init)).startOf('day').toDate();
    let end = moment(JSON.parse(reqm.date_finish)).endOf('day').toDate();

    const querys = {
      dateRegister: {
          $gte: start,
          $lt: end
      }};
      console.log(querys);

      const newpag = await db.getItems(req, model, querys);
     

    // const query = await getAllItemsRangueFromDB(date_init, date_finish)
    res.status(200).json(await newpag)
  } catch (error) {
    utils.handleError(res, error)
  }
}

/**
 * Get item function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
exports.getItem = async (req, res) => {
  try {
    req = matchedData(req)
    const id = await utils.isIDGood(req.id)
    res.status(200).json(await db.getItem(id, model))
  } catch (error) {
    utils.handleError(res, error)
  }
}

exports.getClient = async (req, res) => {
  try {
    req = matchedData(req)
    const id = await req.id;
    console.log(id);
    res.status(200).json(await db.getItemespecific(id, model))
  } catch (error) {
    utils.handleError(res, error)
  }
}

exports.getClientOrder = async (req, res) => {
  try {
    req = matchedData(req)
    console.log(req);
    const id = await req.id;
    let date_init_ = moment(req.date_init,  'YYYY-MM-DD').format('YYYY-MM-DD').toString();
    let date_finish_ = moment(req.date_finish, 'YYYY-MM-DD').format('YYYY-MM-DD').toString();
    let url = `https://racksmafia.myshopify.com/admin/api/2021-07/customers/${id}/orders.json?created_at_min=${date_init_}&created_at_max=${date_finish_}&status=any&financial_status=paid`;
    console.log(url, 'url 1');
    let idori = await extractaxiosShopyOrders(url).then(async r => {
      console.log(r);
      if(r == false) {
        let date_init_2 = moment(req.date_init,  'YYYY-MM-DD').subtract(1, 'months').format('YYYY-MM-DD').toString();
        let date_finish_2 = moment(req.date_finish, 'YYYY-MM-DD').format('YYYY-MM-DD').toString();
        let url = `https://racksmafia.myshopify.com/admin/api/2021-07/customers/${id}/orders.json?created_at_min=${date_init_2}&created_at_max=${date_finish_2}&status=any&financial_status=paid`;
        console.log(url, 'url_2');
        let idori2 = await extractaxiosShopyOrders(url);
        console.log(idori2);
        if(idori2 != false) {
          console.log(idori2, 'respuesta segunda', url);
          res.status(200).json({ 'idorden': idori2.id_client,  'date': idori2.date});
        } else {
          res.status(200).json({ 'idorden': null});
        }
      } else {
        res.status(200).json({ 'idorden': r.id_client});
      }
    });
  
    
    
    // res.status(200).json(await db.getItemespecific(id, model))
  } catch (error) {
    console.log(error);
    utils.handleError(res, error)
  }

}


let extractaxiosShopyOrders = async (url = null) => {
  return new Promise(async (resolve, reject) => {
    try {
      //  req = matchedData(req)
      let baseURL = url;
      let token =  process.env.TOKENSHOPIFY;
      // import qs from 'qs';
      const data = { 'bar': 123 };
      const options = {
        method: 'GET',
        headers: { 'X-Shopify-Access-Token':  token,
                    'Content-Type' : 'application/json'
      },
        // data: qs.stringify(data),
        baseURL,
      };
      const req = await axios(options);

      
      if (req.data.orders.length > 0) {
        req.data.orders.forEach(async element => {
          console.log('data recorrida', element.processed_at);
          let talla = null;
          let camiseta = null;
          if(element.line_items[0].variant_title) {
            let tallaP = element.line_items[0].variant_title.split('/');
            talla = tallaP[0];
            camiseta = tallaP[1];
          } 
          
          let client = {
            name: element.customer.first_name,
            email: element.customer.email,
            idoriginal: element.id,
            iclient: element.customer.id,
            tallas: camiseta ? camiseta : 'xs' ,
            tallaz: talla ? talla : 0,
            custom_data: JSON.stringify(element)
          };
          if (element.financial_status === 'paid' && (element.line_items[0].id == '10396736946340' || element.line_items[0].product_id == '6655717474468')) {
            const doesUserExists = await cityExists(client.idoriginal);
            if(doesUserExists) {
              resolve({id_client : client.idoriginal, date: element.processed_at})
            }
            if (!doesUserExists || null) {
              model.create(client, (err, item) => {
                if (err) {
                  console.log('---->', err)
                } else {
                  resolve({id_client : client.idoriginal, date: element.processed_at})
                }
              })
            }
           
            
          }
        });
      } else {
        resolve (false);
      }
        // res.status(200).json(await 'correcto')
        // return 'arreglodata';
    } catch (error) {
      reject(false)
    }
  })
}


/**
 * Update item function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
exports.updateItem = async (req, res) => {
  try {
    req = matchedData(req)
    const id = await utils.isIDGood(req.id)
    const doesCityExists = await cityExistsExcludingItself(id, req.name)
    if (!doesCityExists) {
      res.status(200).json(await db.updateItem(id, model, req))
    }
  } catch (error) {
    utils.handleError(res, error)
  }
}


/** optener ramdom **/


exports.getRamdom = async (req, res) => {
  try {
    let ramdons = [];
    req = matchedData(req)
    let produts = await getAllproductsFromDB('unique');
    if(!process.env.solonft) {
      ramdons.push(await db.getRamdom(produts, model));

      Promise.all(ramdons).then(async (o) => {
        console.log('YA TERMINE DE REPARTIR los primai')
        let r = await ramdoncomun().then(async (re) => {
          console.log('termine los comunes', re);
          // let n2 = await ramdonft().then(n => {
          //   console.log('termine nft', n);
          // });
        });
        console.log('YA TERMINE DE Otra vez')
      })
    }
   

    if(process.env.solonft == 'true') { 
      let n2 = await ramdonft().then(n => {
        console.log('termine nft', n);
      });
    }


    // let conclutions = await ramdons.forEach(async (g) => {
    //     reqnew = {
    //       box :p,
    //       id: g._id
    //     }
    //    let r =  await db.updateItem(g._id, model, reqnew);
    // })




    //   produts.forEach(async (p) => {
    //   if(p.identification == 'unique') {

    //   } else {
    //     let ramdons = await db.getRamdom(p, model);
    //     await ramdons.forEach( async (g) => {
    //       reqnew = {
    //         box: p,
    //         id: g._id
    //       }
    //       await db.updateItem(g._id, model, reqnew);
    //     });
    //   }
    // })

    res.status(201).json('success')
  } catch (error) {
    utils.handleError(res, error)
  }
}


const ramdoncomun = async () => {
  try {
    let produts = await getAllproductsFromDB('comun');
    console.log('lista de products comunes', produts);
    let ress =  await db.getRamdom(produts, model);
    if(ress) {
      return produts
    }
    
  } catch (error) {
    utils.handleError(res, error)
  }
};


const ramdonft = async () => {
  try {
    let produts = await getAllproductsFromDB('nft');
    console.log('lista de products nft', produts);
    let ress =  await db.getRamdom(produts, model);
    return produts
  } catch (error) {
    utils.handleError(res, error)
  }
};


const getAllprodfindupdateuctsFromDB = async (id, model, req) => {
  console.log(req, id, 'llegue aqui', model);
  return new Promise((resolve, reject) => {
    model.findOneAndUpdate(
      {
        "_id": mongoose,
        "box": { $exists: false }
      },
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
}



const getAllproductsFromDB = async (identification = '') => {
  return new Promise((resolve, reject) => {
    modelproduts.find(
      {
        identification
      },
      '-updatedAt -createdAt',
      {
        sort: {
          identification: -1
        }
      },
      (err, items) => {
        if (err) {
          reject(utils.buildErrObject(422, err.message))
        }
        resolve(items)
      }
    )
  })
}

/**
 * Create item function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
exports.createItem = async (req, res) => {
  try {
    req = matchedData(req)
    const doesCityExists = await cityExists(req.name)
    if (!doesCityExists) {
      res.status(201).json(await db.createItem(req, model))
    }
  } catch (error) {
    utils.handleError(res, error)
  }
}

/**
 * Delete item function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
exports.deleteItem = async (req, res) => {
  try {
    req = matchedData(req)
    const id = await utils.isIDGood(req.id)
    res.status(200).json(await db.deleteItem(id, model))
  } catch (error) {
    utils.handleError(res, error)
  }
}
