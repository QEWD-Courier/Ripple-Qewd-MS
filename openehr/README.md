# Ripple-QEWD-Microservices

Email: <code.custodian@ripple.foundation>

2017 Ripple Foundation Community Interest Company 

[http://ripple.foundation](http://ripple.foundation)

Author: Rob Tweed, M/Gateway Developments Ltd (@rtweed)

## OpenEHR Service

This folder contains the code for the Leeds PHR Demo Authentication Microservice, which provides the Ripple interface to OpenEHR systems

Start up this container as a foreground process using:

       sudo docker run -it -p 8083:8080 -v ~/Ripple-QEWD-Microservices/openehr:/opt/qewd/mapped rtweed/qewd-server

or, to run it as a daemon process:

       sudo docker run -d -p 8083:8080 -v ~/Ripple-QEWD-Microservices/openehr:/opt/qewd/mapped rtweed/qewd-server



