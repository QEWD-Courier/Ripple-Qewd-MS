# Ripple-QEWD-Microservices

Email: <code.custodian@ripple.foundation>

2016 Ripple Foundation Community Interest Company 

[http://ripple.foundation](http://ripple.foundation)

Author: Rob Tweed, M/Gateway Developments Ltd (@rtweed)

## Primary Service

This folder contains the code for the Leeds PHR Demo Primary externally-facing server

Start up this container using:

       sudo docker run -it -p 8080:8080 -v ~/Ripple-QEWD-Microservices/primary:/opt/qewd/mapped -v ~/Ripple-QEWD-Microservices/primary/www/phr:/opt/qewd/www/phr rtweed/qewd-server

## The PHR Demo Application

Make sure you've started all the MicroServices

Start it in a browser using the URL:

      http://{{host-ip-address}}:8080/phr/index.html

eg:

      http://192.168.1.100:8080/phr/index.html

Click the button to start it up

When re-directed to the Gov.Verify sandbox, use the username/password:

      ivor1   / ivor1pass

