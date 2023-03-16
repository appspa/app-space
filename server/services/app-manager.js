'use strict';
import models from '../model'
const _ = require('lodash');
const AppError = require('../utils/app-error');

let proto = module.exports = function (){
  function AppManager() {

  }
  AppManager.__proto__ = proto;
  return AppManager;
};

proto.generateLabelId = function (appId) {
  return models.App.findById(appId).then(data =>{
    if (_.isEmpty(data)){
      throw new AppError.AppError("does not find app");
    }
    // console.log(data)
    let labelId = data.label_id + 1;
    return models.App.updateOne({_id: appId},{
      label_id: labelId
    }).then(t=>{
      return labelId
    })
  });
};
