/*

 ----------------------------------------------------------------------------
 | conductor-service-phr: Ripple PHR Conductor MicroService                 |
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

  16 March 2018

*/


function findRoute(path, routes, method) {
  method = method || 'GET';
  for (var index = 0; index < routes.length; index++) {
    if (routes[index].path === path && routes[index].method === method) return index;
  }
}

function returnArrayResponse(route, routes, property) {
  var index = findRoute(route, routes);
  property = property || 'results';

  routes[index].onResponse = function(args) {
    if (!args.responseObj.message.error) {
      args.handleResponse({
        message: args.responseObj.message[property]
      });
      return true;
    }
  };
}

module.exports = function(routes, ms_hosts) {

  returnArrayResponse('/api/feeds', routes, 'feeds');
  returnArrayResponse('/api/feeds/:sourceId', routes, 'feed');
  returnArrayResponse('/api/patients/:patientId/:heading', routes);
  returnArrayResponse('/api/patients/:patientId/:heading/:sourceId', routes);
  returnArrayResponse('/api/patients/:patientId/top3Things', routes);

  /*

  var index = findRoute('/api/feeds', routes);

  routes[index].onResponse = function(args) {
    console.log('onResponse handler for /api/feeds');
    if (!args.responseObj.message.error) {
      args.handleResponse({
        message: args.responseObj.message.feeds
      });
      return true;
    }
  };

  var index = findRoute('/api/patients/:patientId/:heading', routes);

  routes[index].onResponse = function(args) {
    console.log('onResponse handler for /api/patients/:patientId/:heading');
    if (!args.responseObj.message.error) {
      args.handleResponse({
        message: args.responseObj.message.results
      });
      return true;
    }
  };

  index = findRoute('/api/patients/:patientId/:heading/:sourceId', routes);

  routes[index].onResponse = function(args) {
    console.log('onResponse handler for /api/patients/:patientId/:heading/:sourceId');
    if (!args.responseObj.message.error) {
      args.handleResponse({
        message: args.responseObj.message.results
      });
      return true;
    }
  };

  index = findRoute('/api/patients/:patientId/top3Things', routes);

  routes[index].onResponse = function(args) {
    console.log('onResponse handler for /api/patients/:patientId/:heading/get3Things');
    if (!args.responseObj.message.error) {
      args.handleResponse({
        message: args.responseObj.message.results
      });
      return true;
    }
  };

  */

  index = findRoute('/api/patients/:patientId', routes);

  routes[index].onResponse = function(args) {
    console.log('onResponse handler for /api/patients/:patientId');
    if (!args.responseObj.message.error) {
      var patientArgs = args.responseObj.message;
      console.log('**** patientArgs: ' + JSON.stringify(patientArgs));

      var message = {
        path: '/api/patients/' + patientArgs.demographics.id + '/headings/synopsis',
        method: 'GET',
        headers: {
          authorization: 'Bearer ' + patientArgs.token
        },
        query: {
          max: 10
        }
      };
      args.send(message, function(responseObj) {
        console.log('response from /api/patients/:patientId/headings/synopsis: ' + JSON.stringify(responseObj));

        //add in fields from patient response

        var demographics = patientArgs.demographics;
        var combiResponse = responseObj.message;

        combiResponse.name = demographics.name;
        combiResponse.gender = demographics.gender;
        combiResponse.dateOfBirth = demographics.dateOfBirth;
        combiResponse.id = demographics.id;
        combiResponse.address = demographics.address;
        combiResponse.pasNumber = demographics.pasNo;
        combiResponse.nhsNumber = demographics.nhsNumber;
        combiResponse.gpName = demographics.gpName;
        combiResponse.gpAddress = demographics.gpAddress;
        combiResponse.telephone = demographics.phone;

        args.handleResponse({
          message: combiResponse
        });
      });
      return true;
    }
  };


  return {
    destinations: {
      authentication_service: {
        host: ms_hosts.authentication_service,
        application: 'ripple-auth'
      },
      mpi_service: {
        host: ms_hosts.mpi_service,
        application: 'ripple-mpi'
      },
      cdr_openehr_service: {
        host: ms_hosts.cdr_openehr_service,
        application: 'ripple-cdr-openehr'
      },
      openehr_jumper_service: {
        host: ms_hosts.cdr_openehr_service,
        application: 'ripple-openehr-jumper'
      }
    },
    routes: routes
  };

  return {
    config: config,
    routes: routes
  };
};
