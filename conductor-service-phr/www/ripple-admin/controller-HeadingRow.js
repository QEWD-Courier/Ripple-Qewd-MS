/*

 ----------------------------------------------------------------------------
 | ripple-admin: Ripple User Administration MicroService                    |
 |                                                                          |
 | Copyright (c) 2018 Ripple Foundation Community Interest Company          |
 | All rights reserved.                                                     |
 |                                                                          |
 | http://rippleosi.org                                                     |
 | Email: code.custodian@rippleosi.org                                      |
 |                                                                          |
 | Author: Rob Tweed, M/Gateway Developments Ltd                            |
 |                                                                          |
 | Licensed under the Apache License, Version 2.0 (the "License");          |
 | you may not use this file except in compliance with the License.         |
 | You may obtain a copy of the License at                                  |
 |                                                                          |
 |     http://www.apache.org/licenses/LICENSE-2.0                           |
 |                                                                          |
 | Unless required by applicable law or agreed to in writing, software      |
 | distributed under the License is distributed on an "AS IS" BASIS,        |
 | WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. |
 | See the License for the specific language governing permissions and      |
 |  limitations under the License.                                          |
 ----------------------------------------------------------------------------

  13 June 2018

*/

function isInt(value) {
  value = value.toString();
  var n = Math.floor(Number(value));
  return n !== Infinity && String(n) === value && n >= 0;
}

function isDate(value) {
  if (isInt(value) && value.toString().length > 11) return true;
  return false;
}

module.exports = function (controller, component) {

  component.unlockedBtnVisibility = 'btn btn-warning';
  component.lockedBtnVisibility = 'hidden';
  component.deleteBtnVisibility = 'btn btn-danger';

  component.onNewProps = function(newProps) {
    //component.unlockedBtnVisibility = 'btn btn-warning';
    //component.lockedBtnVisibility = 'hidden';
  };

  component.deleteHeading = function() {
    controller.emit('DeleteHeading', {id: component.props.id});
  };

  component.convert = function(value) {
    if (value === true) return 'true';
    if (value === false) return 'false';
    if (isDate(value)) return new Date(value).toUTCString();
    return value;
  };

  component.lockRecord = function() {
    //component.unlockedBtnVisibility = 'hidden';
    //component.lockedBtnVisibility = 'btn btn-success';
    controller.emit('lockRecord', {id: component.props.id});
    //component.setState({
    //  status: 'recordLocked'
    //});
  }

  component.unlockRecord = function() {
    //component.unlockedBtnVisibility = 'btn btn-warning';
    //component.lockedBtnVisibility = 'hidden';
    controller.emit('unlockRecord', {id: component.props.id});
    //component.setState({
    //  status: 'recorUnlocked'
    //});
  }

  return controller;
};
