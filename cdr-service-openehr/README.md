# Ripple-QEWD-Microservices

Email: <code.custodian@ripple.foundation>

2017-18 Ripple Foundation Community Interest Company 

[http://ripple.foundation](http://ripple.foundation)

Author: Rob Tweed, M/Gateway Developments Ltd (@rtweed)

## CDR OpenEHR Service

This folder contains the code for the CDR OpenEHR MicroService, which provides the Ripple interface to 
one or more back-end OpenEHR systems

Start up this container as a foreground process the *rtweed/qewd-server* Docker Container:

       sudo docker run -it -p 8083:8080 -v ~/ripple/cdr-service-openehr:/opt/qewd/mapped rtweed/qewd-server

or, to run it as a daemon process:

       sudo docker run -d -p 8083:8080 -v ~/ripple/cdr-service-openehr:/opt/qewd/mapped rtweed/qewd-server


Note 1: the -p parameter defines the port mapping, using the convention:

      -p {external port}:{internal port}

The *qewd-server* container always uses port 8080 internally.  

The external port is for you to define.  You MUST ensure that it is accessible from:

- the PHR Conductor service and matches with its ms-hosts.json configuration;
- the IDCR Conductor service and matches with its ms-hosts.json configuration;


Note 2: if you're using a Raspberry Pi (RPi), use the RPi-specific Container: *rtweed/qewd-server-rpi*


## Using the OpenEHR Jumper Functionality

OpenEHR Jumper automates the fetching and updating of OpenEHR data, avoiding the need for hand-crafted
AQL and Flat JSON definitions.  Instead, OpenEHR Jumper just needs to know the name of each
OpenEHR Template that you're interested in using.

### Specifying the OpenEHR Templates you want to Automate

The clinical headings and the associated OpenEHR Templates that will be accessible via the 
OpenEHR Jumper functionality are defined in the *headings* part of the *userDefined.json* file that you'll
find in the same folder as this README file.

For example, you'll see that Allergies are specifed in this file:

         "headings": {
            "allergies": {
              "template": {
                "name": "IDCR - Adverse Reaction List.v1"
              },
              "fhir": {
                "name": "AllergyIntolerance"
              }
            },
            ...etc

Each heading is given a local name (eg *allergies* above).  For each heading you can define the
OpenEHR template name (eg see *heading.allergies.template.name*) and, optionally, the corresponding 
standard FHIR resource name (eg see *heading.allergies.fhir.name*).

### The Initialisation Stage

Every time the *cdr-service-openehr* MicroService is started/restarted, it checks the template
definitions and determines whether or not to initialise them.

The directory */cdr-service-openehr/modules/ripple-openehr-jumper/templates* is used by this
MicroService - if a new template is specified, it automatically builds a number of initial versions
of template and other JSON files that it uses for the OpenEHR Jumper Automation.

You'll find that a set of files already exists for Allerges: see
*/cdr-service-openehr/modules/ripple-openehr-jumper/templates/allergies*

On completion of this initialisation stage, each heading directory will contain a JSON file named
*headingStatus.json*, containing:

        {
          "status": "locked"
        }

If the value of this status property is *locked*, then the files in this directory will be
left alone and unchanged next time the *cdr-service-openehr* MicroService is started/restarted.

If it has any other value, the heading will be re-initialised and any files in the
*/cdr-service-openehr/modules/ripple-openehr-jumper/templates/{{heading-name}}* directory
will be over-written.

The Initialisation stage works by fetching the so-called *Web Template* for the specified
OpenEHR Template and parsing it.  A number of initial JSON-based template files
are created from the data in this Web Template document, along with a set of data records that
are stored in the QEWD Database.

On completion of the Initialisation stage, OpenEHR Jumper is ready for fetching and saving 
instances of the heading for a specified patient.

### Using OpenEHR Jumper to Fetch a Patient's Heading Records

Let's say we want to not fetch all the Allergy records for a patient.  Instead of running a hand-crafted
AQL query, we can simply invoke a REST request as follows:

         GET /api/openehr/jumper/patient/{{patientId}}/template/{{templateName}}

For example

        GET /api/openehr/jumper/patient/9999999000/template/IDCR - Adverse Reaction List.v1

Note: the request must include a valid JSON Web Token in the Authorization header.  See the next
section below for tips on how to obtain one.

If your request is valid, what will be returned will be a JSON array containing each Allergy record.  The 
format of each Allergy record is derived from the information in the template's Web Template.  If you look at
the file in the 
*/cdr-service-openehr/modules/ripple-openehr-jumper/templates/allergies* directory that is named
*OpenEHR_get_template.json*, you'll see what the expected structure is - note that this template
file assumes all the possible data fields exist, which is often not the case.

So, for allergies, most of the data returned by the Jumper request will be within this structure:


        {
          "allergies_and_adverse_reactions": {
          "adverse_reaction_risk": {
            // data records here
          }
        }


For example:

        {
          "allergies_and_adverse_reactions": {
            "adverse_reaction_risk": {
              "causative_agent": {
                "value": "{{causative_agent}}",
                "code": "{{causative_agent_codeString}}",
                "terminology": "{{causative_agent_terminology}}"
              },
              ...etc





### Transforming the Default OpenEHR Jumper Format to PulseTile or FHIR Format

By modifying the URL, you can request the output in either PulseTile or FHIR format, eg:


        GET /api/openehr/jumper/patient/9999999000/template/IDCR - Adverse Reaction List.v1?format=pulsetile
        GET /api/openehr/jumper/patient/9999999000/template/IDCR - Adverse Reaction List.v1?format=fhir

What happens is that OpenEHR Jumper applies the appropriate template to convert the OpenEHR format
that was described above into PulseTile or FHIR JSON format.

Look for the files:

        /cdr-service-openehr/modules/ripple-openehr-jumper/templates/{{heading-name}}/openEHR_to_Ripple.json*
        /cdr-service-openehr/modules/ripple-openehr-jumper/templates/{{heading-name}}/openEHR_to_FHIR.json*

For example:

        /cdr-service-openehr/modules/ripple-openehr-jumper/templates/allergies/openEHR_to_Ripple.json*
        /cdr-service-openehr/modules/ripple-openehr-jumper/templates/allergies/openEHR_to_FHIR.json*


When a new heading is initialised by OpenEHR Jumper, a minimal version of both these template
files is automatically created for you, mapping the 3 or 4 properties that all Templates will
normally return to corresponding properties that are normally expected by PulseTile or in a FHIR
Resource document.

The idea is that you manually edit these template files to produce the correct output content and
format for PulseTile and/or FHIR.  The JSON Transformation Template documents should adhere to the
syntax used by the [qewd-transform-JSON](https://github.com/robtweed/qewd-transform-json) Module.
You can use the [browser-based transformation editing tool](https://github.com/robtweed/qewd-transform-json-editor)
to simplify the task of defining the transformation documents.

When a definitive version of a JSON mapping Template document has been created for an
OpenEHR Template, we anticipate and hope that its author(s) will distribute them to other
OpenEHR Jumper users, ideally via Github.

You will find that we have done this for you already for Allergies - the directory
*/cdr-service-openehr/modules/ripple-openehr-jumper/templates/allergies/* contains a set of
pre-constructed template documents and a *headingStatus.json* file that sets the status to
*locked* to prevent them being over-written by OpenEHR Jumper when it is next started up.

Use the pre-built template documents in this directory as working examples to help you create
equivalent ones for other OpenEHR Templates / Headings.


### Obtaining a Valid JSON Web Token

The Ripple-QEWD MicroService application will normally look after the creation and authentication of
JSON Web Tokens (JWTs), and you can largely be unaware of their presence or role.

However, if you want to use the OpenEHR Jumper URL manually within a REST Client, you will
need to add a valid JWT to each request's Authorization header.

One of the simplest ways to do this is to log in and begin using the Leeds PHR application, first
making sure that you have the browser's JavaScript console open (eg open up Chrome Developer Tools).

Select one of the headings, eg Vaccinations, from the left-hand menu, and, using the Developer Tools,
inspect the HTTP Request Header for the request that was sent to fetch the Vaccination results.  Look
for the Cookie header.  You should see a cookie named JSESSIONID, eg:

        Cookie:JSESSIONID=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiO
          jE1MjIxNDY3NTgsImlhdCI6MTUyMjE0NTU1OCwiaXNzIjoicWV3ZC5qd3Qi
          LCJhcHBsaWNhdGlvbiI6InJpcHBsZS1hdXRoIiwidGltZW91dCI6MTIwMCw
          icWV3ZCI6Ijc0NGIwMDc2OGI2NzExMmI0ZjdkODVmNjlhOTMzOWI0ZD
          VkZTZiODAzMjZjYmJmOTdkZmI3Yjg1OWU0MmIxY2JkYzBmMTg3MDc1ZWY2
          OTNjMzJhMTFjMDU2ZWJhZWE5NGNiM2ZlYmVlNmM1MzA5MjZ
          jZGZkNDM2MzMxMDVhNzBlNjYzNDE3MmM0N2Q5YWNkMzM0ZDVkNDVh
          YTNmOWZjYWE0NjQxMjU2YmZiNzA3NmM2IiwidXNlck1vZGUiOiJhZG
          1pbiIsImdpdmVuX25hbWUiOiJSb2IiLCJmYW1pbHlfbmFtZSI6IlR3ZWV
          kIiwiZW1haWwiOiJyb2IudHdlZWRAZ21haWwuY29tIiwicm9sZSI6IklE
          Q1IiLCJyb2xlcyI6WyJJRENSIl0sInVpZCI6ImExMzJjN2FmLTY5ZWMtND
          cyNi1hNTk4LTE5NjlhZWExN2U2ZSJ9.8_9eA9bu0qDxw3nf750B3PJpEMr
          3r882djIir-sKiZo


Copy the long string value that follows *JSESSIONID=* and paste it into
your REST Client as the Authorization Header.  Then prefix the string with the text *Bearer* followed by
as space, eg:

        Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiO
          jE1MjIxNDY3NTgsImlhdCI6MTUyMjE0NTU1OCwiaXNzIjoicWV3ZC5qd3Qi
          LCJhcHBsaWNhdGlvbiI6InJpcHBsZS1hdXRoIiwidGltZW91dCI6MTIwMCw
          icWV3ZCI6Ijc0NGIwMDc2OGI2NzExMmI0ZjdkODVmNjlhOTMzOWI0ZD
          VkZTZiODAzMjZjYmJmOTdkZmI3Yjg1OWU0MmIxY2JkYzBmMTg3MDc1ZWY2
          OTNjMzJhMTFjMDU2ZWJhZWE5NGNiM2ZlYmVlNmM1MzA5MjZ
          jZGZkNDM2MzMxMDVhNzBlNjYzNDE3MmM0N2Q5YWNkMzM0ZDVkNDVh
          YTNmOWZjYWE0NjQxMjU2YmZiNzA3NmM2IiwidXNlck1vZGUiOiJhZG
          1pbiIsImdpdmVuX25hbWUiOiJSb2IiLCJmYW1pbHlfbmFtZSI6IlR3ZWV
          kIiwiZW1haWwiOiJyb2IudHdlZWRAZ21haWwuY29tIiwicm9sZSI6IklE
          Q1IiLCJyb2xlcyI6WyJJRENSIl0sInVpZCI6ImExMzJjN2FmLTY5ZWMtND
          cyNi1hNTk4LTE5NjlhZWExN2U2ZSJ9.8_9eA9bu0qDxw3nf750B3PJpEMr
          3r882djIir-sKiZo

Your OpenEHR Jumper requests should now be accepted and authenticated.
