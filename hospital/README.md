# Ripple-QEWD-Microservices

Email: <code.custodian@ripple.foundation>

2016 Ripple Foundation Community Interest Company 

[http://ripple.foundation](http://ripple.foundation)

Author: Rob Tweed, M/Gateway Developments Ltd (@rtweed)

## Hospital Service

This folder contains the code for the Leeds PHR Demo Authentication Microservice, which provides the Ripple interface to Hospital systems (initially simulated using the QEWD database holding demo demographic data)

Start up this container using:

       sudo docker run -it -p 8082:8080 -v ~/Ripple-QEWD-Microservices/hospital:/opt/qewd/mapped rtweed/qewd-server



