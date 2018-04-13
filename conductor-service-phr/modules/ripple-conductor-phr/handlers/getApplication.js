/*

 ----------------------------------------------------------------------------
 | ripple-conductor-phr: Ripple PHR Conductor MicroService                  |
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

  7 february 2018

*/

module.exports = function(args, finished) {

  return finished({
    themeColor: '',
  });

  /*

  finished({
    browserTitle: "PulseTile-RF",
    logoB64: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJYAAAAmCAIAAACpqfXAAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMTM4IDc5LjE1OTgyNCwgMjAxNi8wOS8xNC0wMTowOTowMSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTcgKFdpbmRvd3MpIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjZGOTYyQUQ1RTI2QzExRTc5OEY3ODI5Q0Y5RDM0MjU4IiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOjZGOTYyQUQ2RTI2QzExRTc5OEY3ODI5Q0Y5RDM0MjU4Ij4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6NkY5NjJBRDNFMjZDMTFFNzk4Rjc4MjlDRjlEMzQyNTgiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6NkY5NjJBRDRFMjZDMTFFNzk4Rjc4MjlDRjlEMzQyNTgiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz5thatKAAAEUklEQVR42uxaa0hTYRg+uxiV0MhFBC6JapKSZrTUTIUuZlhGZLgZlGWguP0Qtf6kBtGCoJr0I6XAlhnk7EJkiTrQmJnXKLqZLiO8gIQaFpnYttN7/NbxdLaztpm5ue9h4Od33vPu7Dx73u95vzMeSZIEhjeDhynEFGJgCjEwhZhCTCGmEANT6HE3RTPpORdD5i1wHMDHhHk7MIVeD+FfIz4Ojq5JOIvGvfqi1YEBXJFHz94tv93sONsVtVx5IJqZkxNBy8jaAq7IlWFBWbsjCo5t4zp79Ot46b22Qt0zom+YTqiWx2SnRAUsWYxVOPfof91XeOEhLzS35H6r7VGd/pU4ugACpvkD9A3DDMzDUUyhB0FVqDunbWTO6NuMihytg1Pg6HxiUTgbSdPTtt4oOuhksOPizBUJ4juvawEtwhi0tVYilieEo0OnyhroynklcwfUbVqaikvVSJcwoOOdwbE4wfXNAuZMidGi6jATQyQzIKPDrG0y255IBVebrEtJslAp5bNTdVuIHotvqRCI6dPlwopoFRZw8xudT9+jQWV+Ms0fADjrLcumi2pn18CMLkDKJw/5Eav+wQ2kUu0VEsF8D1Lhf8MTTbrV7ExRIguRUGORPzH2Hf6OfBtnxYOI1Sf3obEbpmZaZCt4hp3CuOU8Q6wg/pM76rGTKlIQ75YQvZtCoASEiMppXasRUZieFIGMMSyTX8Z+sCyoAxPrAobI+HYzSCdkydynmhUK4Q7a7S7qtcqEKClr0m7PIItd13Ety5n32r5+ZfkUhcaBETRzOmN7eXM3WvNgmaR8qchfnbljqWgRs67OFAsJD0nl3SrkkiasefIzd+hFEeoqReSULqGQ/gMhBvMN4ZS7qer/Y3sSnAvL9fwdUEjtpfJpChGLIGKwoDfrX9Y8fsE8BFw+aOmpu3jYjbWQxdDwBKkymNy7Qlaqps+kSm/yIApnqalwFWBBqc7hwhHoQNrfDtC1HdSZd7nG+Svk9CPQVExwmBTubsQWwF/8rZ++29o3vOlHA6lE7KADAcLId8VJezbSq/Xo13E3aONpJtGLompiRt8AKk/ZJEgZ7CiUUx+lUN9mRHYUkBgtRf37OW0jvOzuv1QwlPe8a3DuP8AYkdpJNRLQV/iinQEZHdc8ojdiUEfxYWAEOReYcWn/Za7Q2G7uChOAELdFCmDsQyoEnYlTi2kJVuYno0Harg30/kuQvJipRZBs4okK6z8i/00hgR7yWUKbKCNTJeMTotlXIdcTIpZT5+oLbSMd5ATA6uXku9OCQ/svSIhAsCJHq7B3Sq4ixoMeOfVYSowWpZRvSPZzw9d4fVOBHkAyZ9BXxFpOOQyzJifJpXcB88Kymk4G2M6rqk0qmzC7k/OcQlnsuv1bgrmadJjPTokqvdd2tfYlXWyRXiNDJbY7RF4N/PMnezcF//wJ438CU4gpxMBrIQamEFOIKcQUYmAKMTCFvo1fAgwABVER5WwLtyAAAAAASUVORK5CYII=",
    themeColor: "green",
    title: "PulseTile-yyy"
  });
  */
};
