// import { wrapper } from ".";

export default class ParameterWrapper {

  static wrapper(parameters) {
    // ParameterWrapper.filter(parameters)
    Object.getOwnPropertyNames(parameters)
    .map(key => {
      /// 如果是数组
      if (parameters[key] instanceof Array) {
        let item = parameters[key][0]
        ParameterWrapper.wrapper(item)
        parameters[key] = {
          'type': 'array',
          'items': {
            'properties': item
          }
        }
        
      } else if (parameters[key] instanceof Object) {
        let object = parameters[key]
        let type = object['type']
        /// 若果type 存在
        if (type) {
          if (type['name']) {
            parameters[key]['type'] = ParameterWrapper.wrapType(type['name'])
            
            // parameters[key]['type'] = 'string'
          }
        } else {
          if (parameters[key] instanceof Function) {
            parameters[key] = {
              // 'type': parameters[key]['name'].toLowerCase
              'type': ParameterWrapper.wrapType(parameters[key]['name'])
            }
          } else {
            let item = parameters[key]
            ParameterWrapper.wrapper(item)
            parameters[key] = {
              'type': 'object',
              'properties': item
            }
          }
        }
      }
    })
    console.log(JSON.stringify(parameters))
  }


  static wrapType(type) {
    let newType = type.toLowerCase()
    if (newType === 'boolean' ||  newType === 'integer') {
      return newType
    } else if (newType === 'double') {
      return 'number'
    } else if (type === 'arrays') {
      return 'array'
    } else {
      return 'string'
    }
    return newType
  }

  // static filter(parameters) {
  //   Object.getOwnPropertyNames(parameters)
  //     .map (key => {
  //       let hidden = parameters[key]['hidden']
  //       if (hidden) {
  //         if (hidden == true) {
  //           parameters[key] = undefined
  //         }
  //       } else {
  //         let value = parameters[key]
  //         if (value) {
  //           if (value instanceof Array) {
  //             if (parameters[key].count == 0) {
  //               parameters[key] = undefined
  //             } else {
  //               let item = parameters[key][0]
  //               ParameterWrapper.filter(item)
  //               if (!item) {
  //                 parameters[key] = undefined
  //               }
  //             }
  //           } else if (value instanceof Function) { //value势函数
              
  //           } else if (value instanceof Object) { // value是对象
  //             ParameterWrapper.filter(value)
  //           }
  //         }
  //       }
  //     })
  // }

}