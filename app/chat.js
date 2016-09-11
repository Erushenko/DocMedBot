
'use strict';

function Chat() {
  this._curTypeDoc = undefined;  //Object - current type doc example 'Больничный лист'
  this._curInterviews = undefined;  //Object - current interviews
  this._curInterview = undefined;  //Object - current interview
  this._curCount = -1;  //integer - current count interview

}

module.exports = Chat;
