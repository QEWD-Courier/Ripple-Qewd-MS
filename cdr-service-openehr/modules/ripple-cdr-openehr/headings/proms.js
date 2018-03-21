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

20 March 2018

*/

var heading = {
  name: 'proms',
  textFieldName: 'name',
  headingTableFields: ['name', 'score'],

  get: {

    transformTemplate: {
      name:               '{{PROMS_type}}',
      score:              '{{Pain_scale}}',
      procedureSourceId:  '{{Procedure_link}}',
      specific_q1:        '{{a_1_Health_in_general}}',
      specific_q2:        '{{a_2_Health_compared_to_1_year_ago}}',
      specific_q3:        '{{a_3_Vigorous_activies}}',
      specific_q4:        '{{a_4_Moderate_activies}}',
      specific_q5:        '{{a_5_Lifting_or_carrying_groceries}}',
      author:              '{{author}}',
      dateCreated:         '=> getRippleTime(date_created)',
      source:              '=> getSource()',
      sourceId:            '=> getUid(uid)'
    }

  },

  post: {
    templateId: 'Ripple PROMS.v0',
    //destination: 'marand',

    transformTemplate: {
      ctx: {
        composer_name:               '=> either(author, "Dr Tony Shannon")',
        'health_care_facility|id':   '=> either(healthcareFacilityId, "999999-345")',
        'health_care_facility|name': '=> either(healthcareFacilityName, "Home")',
        id_namespace:                'NHS-UK',
        id_scheme:                   '2.16.840.1.113883.2.1.4.3',
        language:                    'en',
        territory:                   'GB',
        time:                        '=> now()'
      },
      generic_proms: {
        context: {
          proms_type:                '{{name}}',
          ecis_procedure_link:       '{{procedureSourceId}}'
        },
        'sf-36': [
          {
            'a1._health_in_general|code':             '{{specific_q1}}',
            'a2._health_compared_to_1_year_ago|code': '{{specific_q2}}',
            'a3._vigorous_activies|code':             '{{specific_q3}}',
            'a4._moderate_activies|code':             '{{specific_q4}}',
            'a5._lifting_or_carrying_groceries|code': '{{specific_q5}}'
          }
        ],
        pain_vas: [
          {
            pain_scale:              '{{score}}'
          }
        ]
      }
    }
  }
};

module.exports = heading;
