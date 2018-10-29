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

  26 October 2018

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
    if (args && args.responseObj && args.responseObj.message && !args.responseObj.message.error) {
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
  //returnArrayResponse('/api/patients/:patientId/top3Things', routes);

  var index = findRoute('/api/auth/login', routes);

  routes[index].onResponse = function(args) {
    console.log('** onResponse handler for /api/auth/login');
    console.log('** args = ' + JSON.stringify(args, null, 2));

    //  note - the response from this is further modified in remap_routes.js
    //   see the onResponse handler for /api/initialise
    
    var response = args.responseObj.message;
    if (!response.error) {
      if (response.authenticated) {

         // user has logged in via OpenId Connect

        var recordStatus;
        var new_patient;
        var api_response;
        var message;

        // we need to check the OpenEHR machine and see if the NHS Number has been created yet
        //  NHS Number to be checked is in the JWT
        //  The EtherCIS record will also be populated in the background from Discovery data
        //   While this is happening responses from /api/initialise will return a status of 'loading_data'
        //   On completion, this status will change to "ready"

        message = {
          path: '/api/openehr/check',
          method: 'GET',
          headers: {
            authorization: 'Bearer ' + args.responseObj.message.token
          }
        };
        args.send(message, function(openehrResponse) {
          console.log('**** response from OpenEHR to /api/openehr/check: \n' + JSON.stringify(openehrResponse, null, 2));
          if (openehrResponse.message) {
            if (openehrResponse.message.status) {
              recordStatus = openehrResponse.message.status;
              console.log('&&& recordStatus set to ' + recordStatus);
            }
            if (typeof openehrResponse.message.new_patient !== 'undefined') {
              new_patient = openehrResponse.message.new_patient;
              console.log('&&& new_patient set to ' + new_patient);
            }
          }
          api_response = args.responseObj;
          if (recordStatus === 'loading_data') {
            api_response.message.status = recordStatus;
            api_response.message.new_patient = new_patient;
          }
          console.log('*** api_response = ' + JSON.stringify(api_response, null, 2));

          if (recordStatus === 'ready') {

            // pre-fetch the demographics now to avoid later race conditions and speed up UI later

            var message = {
              path: '/api/demographics/dummy',
              method: 'GET',
              headers: {
                authorization: 'Bearer ' + args.responseObj.message.token
              }
            };
            args.send(message, function(discoveryResponse) {
              console.log('**** pre-cache response from Discovery for /api/demographics/dummy: \n' + JSON.stringify(discoveryResponse, null, 2));
              args.handleResponse(api_response);
            });
          }
          else {
            args.handleResponse(api_response);
          }
        });
        return true;
      }
    }

  };

  var index = findRoute('/api/patients/:patientId/:heading', routes);

  routes[index].onResponse = function(args) {
    //console.log('onResponse handler for /api/patients/:patientId/:heading');

    var respMsg = args.responseObj.message;

    //console.log('response = ' + JSON.stringify(respMsg, null, 2));
    if (!respMsg.error) {

      //var arr1 = args.responseObj.message.results.cdr_discovery_service.results;

      if (respMsg.refresh) {
        
        console.log('!!!!! refresh needed');

        var message = {
          path: '/api/patients/' + respMsg.patientId + '/' + respMsg.heading,
          method: 'GET',
          headers: {
            authorization: 'Bearer ' + respMsg.token
          }
        };
        args.send(message, function(responseObj) {
          //console.log('*** refresh response = ' + JSON.stringify(responseObj, null, 2));
          args.handleResponse(responseObj);
        });
        return true;
      }
      else {
        args.handleResponse({
          message: respMsg.results
        });
        return true;
      }
    }
  };

  /*

  var index = findRoute('/api/patients/:patientId/:heading/:sourceId', routes);

  routes[index].onResponse = function(args) {
    console.log('onResponse handler for /api/patients/:patientId/:heading/:sourceId');
    console.log('** returned ' + JSON.stringify(args.responseObj, null, 2));
    if (!args.responseObj.message.error) {
      var results = {};
      var discoveryResult = args.responseObj.message.results.cdr_discovery_service;
      var openehrResult = args.responseObj.message.results.cdr_openehr_service;

      if (discoveryResult.error && openehrResult.results) {
        results = openehrResult.results;
      }
      else if (openehrResult.error && discoveryResult.results) {
        results = discoveryResult.results;
      }
      else if (openehrResult.results && openehrResult.results.length === 0) {
        if (discoveryResult.results) results = discoveryResult.results;
      }
      else if (!discoveryResult.results) {
        if (openehrResult.results) results = openehrResult.results;
      }
      args.handleResponse({
        message: results
      });
      return true;
    }
  };

  */


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
    //console.log('onResponse handler for /api/patients/:patientId');
    if (!args.responseObj.message.error) {
      var patientArgs = args.responseObj.message;
      //console.log('**** patientArgs: ' + JSON.stringify(patientArgs));

      args.handleResponse({
        message: patientArgs.demographics
      });

      /*
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
        //console.log('response from /api/patients/:patientId/headings/synopsis: ' + JSON.stringify(responseObj));

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
      */
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
      },
      cdr_discovery_service: {
        host: ms_hosts.cdr_discovery_service,
        application: 'ripple-cdr-discovery'
      },
      cdr_services: {
        destinations: ['cdr_openehr_service', 'cdr_discovery_service']
      }
    },
    routes: routes
  };

  return {
    config: config,
    routes: routes
  };
};
