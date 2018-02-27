# Ripple OpenEHR Jumper

Email: <code.custodian@ripple.foundation>

2017-18 Ripple Foundation Community Interest Company 

[http://ripple.foundation](http://ripple.foundation)

Author: Rob Tweed, M/Gateway Developments Ltd (@rtweed)

# Automating and Simplifying Access to OpenEHR Data

## Installation

This Proof Of Concept version assumes you've already installed 
[https://github.com/RippleOSI/Ripple-Qewd](Ripple-QEWD)


Copy this directory/folder into your Ripple System's node_modules directory, eg into:

        ~/qewd/node_modules/ripple-qewd-jumper


## Setting up a Heading to use the Jumper Automation

Start a Terminal session and switch to your QEWD directory, eg:

       cd ~/qewd

Start the Node.js REPL:

       node

Then load the Jumper command-line script:

      var jumper = require(‘ripple-qewd-jumper’).jumper
      jumper()


You'll be asked for 3 things:

- the name of the OpenEHR Template for the heading you want to automate, eg: 

       IDCR - Adverse Reaction List.v1


- the name of the corresponding FHIR Resource, eg:

       AllergyIntolerance

- the heading name that you want to refer to within Ripple, eg:

       allergies

The Jumper script will create a new folder within your Ripple System, eg:

      ~/qewd/node_modules/qewd-ripple/lib/jumper

and within this folder, you'll find one that uses the last of the names you specified, eg:


      ~/qewd/node_modules/qewd-ripple/lib/jumper/allergies


What's in these directories are the initial "bare bones" mapping template files that will provide
JSON mappings between:

- the Ripple UI format
- OpenEHR Template AQL format
- OpenEHR Template Flat JSON format
- FHIR format

However, they now need to be further expanded by making use of the OpenEHR WebTemplate for the
heading you're automating.


## Processing the Web Template

Start up a REST client, eg Advanced REST Client for Chrome or PostMan

Obtain a Ripple/QEWD Session token by sending the request:

      GET /api/initialise


eg:

      GET http://myRippleSystem.org/api/initialise

You should get back a JSON response which contains a property named *token*.  Copy its value.

Add a Request Header named Authorization, and paste the token value as the Authorization header's value.

Now send the request that will fetch and process the WebTemplate document for your heading, eg:


      GET /jumper/openehr/template/{{heading_name}}

for example:

      GET http://myRippleSystem.org/jumper/openehr/template/IDCR%20-%20Adverse%20Reaction%20List.v1


You should see a pretty large JSON response.  You can largely ignore this - it's what has been 
created behind the scenes that's important.  In particular a QEWD Database Document named 
*RippleQEWDJumper* has been created.  This contains all the relevant information from the
WebTemplate that will be needed to automate access to the heading, indexed to optimise run-time
performance.

You'll also find several more JSON files in the Ripple-QEWD */jumper* directory.


You're now ready to begin using OpenEHR Jumper to fetch and transform the heading's data into the
various JSON formats.

Initially, however, the mappings will be incomplete and just for the properties that OpenEHR Jumper 
knew applied to all headings.  For all other properties, you'll need to manually create the full
template mappings.

These steps are described in the video at this link:

         https://www.youtube.com/watch?v=iaGGGgJdWvM

For more information on creating Template Mappings, see:

         https://github.com/robtweed/qewd-transform-json-editor
         https://github.com/robtweed/qewd-transform-json

