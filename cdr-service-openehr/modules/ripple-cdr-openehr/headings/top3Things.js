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

22 October 2018

*/

var heading = {
  name: 'top3things',
  textFieldName: 'name1',
  headingTableFields: ['name1', 'name2', 'name3'],

  get: {

    transformTemplate: {
      name1:               '{{Issue_1_Name}}',
      description1:        '{{Issue_1_Detail}}',
      name2:               '{{Issue_2_Name}}',
      description2:        '{{Issue_2_Detail}}',
      name3:               '{{Issue_3_Name}}',
      description3:        '{{Issue_3_Detail}}',
      author:              '{{author}}',
      dateCreated:         '=> getRippleTime(date_created)',
      source:              '=> getSource()',
      sourceId:            '=> getUid(uid)'
    }

  },

  post: {
    templateId: 'IDCR - Top issues.v0',

    transformTemplate: {
      ctx: {
        composer_name:               '=> either(author, "Patient")',
        'health_care_facility|id':   '=> either(healthcareFacilityId, "999999-345")',
        'health_care_facility|name': '=> either(healthcareFacilityName, "Home")',
        id_namespace:                'NHS-UK',
        id_scheme:                   '2.16.840.1.113883.2.1.4.3',
        language:                    'en',
        territory:                   'GB',
        time:                        '=> now()'
      },
      top_issues: {
        story_history: [
          {
            issue_1: {
              issue_1_name:   '{{name1}}',
              issue_1_detail: '{{description1}}',
            },
            issue_2: {
              issue_2_name:   '{{name2}}',
              issue_2_detail: '{{description2}}',
            },
            issue_3: {
              issue_3_name:   '{{name3}}',
              issue_3_detail: '{{description3}}',
            }
          }
        ]
      }
    }
  }
};

module.exports = heading;
