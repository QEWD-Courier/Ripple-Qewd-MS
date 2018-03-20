/*

 ----------------------------------------------------------------------------
 | qewd-ripple: QEWD-based Middle Tier for Ripple OSI                       |
 |                                                                          |
 | Copyright (c) 2016-18 Ripple Foundation Community Interest Company       |
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

  6 February 2018

*/

/*

Top 3 Things detail

  GET /api/patients/9999999000/top3Things/xxx-yyy-zzzz

*/

var tools = require('../src/tools');

function getTop3ThingsDetail(args, finished) {

  var patientId = args.patientId;

  // override patientId for PHR Users - only allowed to see their own data

  if (args.session.role === 'phrUser') patientId = args.session.nhsNumber;

  var valid = tools.isPatientIdValid(patientId);
  if (valid.error) return finished(valid);

  // ignore the sourceId - always get the latest

  /*
  var sourceId = args.sourceId;
  if (!sourceId || sourceId === '') {
    return finished({error: 'Missing or invalid SourceId'});
  }
  */

  //var doc = this.db.use('Top3Things', ['bySourceId', sourceId]);

  var doc = this.db.use('Top3Things');
  var sourceId = doc.$(['byPatient', patientId, 'latest']).value;

  /*
  if (!doc.exists) {
    return finished({error: 'Invalid SourceId'});
  }

  var top3 = doc.getDocument();
  */

  if (sourceId === '') {
    return finished([]);
  }

  var top3 = doc.$(['bySourceId', sourceId]).getDocument();

  var detail = {
    source: 'QEWDDB',
    sourceId: sourceId,
    dateCreated: top3.date,
    name1: top3.data.name1,
    description1: top3.data.description1,
    name2: top3.data.name2,
    description2: top3.data.description2,
    name3: top3.data.name3,
    description3: top3.data.description3
  };

  finished(detail);
}

module.exports = getTop3ThingsDetail;
