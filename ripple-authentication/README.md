# Ripple-QEWD-Microservices

Email: <code.custodian@ripple.foundation>

2017-18 Ripple Foundation Community Interest Company 

[http://ripple.foundation](http://ripple.foundation)

Author: Rob Tweed, M/Gateway Developments Ltd (@rtweed)

## Authentication Service

This folder contains the code for the Ripple Demo Authentication Microservice, which provides the Ripple interface to Auth0.

Start up this container as a foreground process using the *rtweed/qewd-server* Docker Container:

        sudo docker run -it -p 8085:8080 -v ~/phr/docker/ripple-authentication:/opt/qewd/mapped rtweed/qewd-server

or, to run it as a daemon process:

        sudo docker run -d -p 8085:8080 -v ~/phr/docker/ripple-authentication:/opt/qewd/mapped rtweed/qewd-server


Note: if you're using a Raspberry Pi (RPi), use the RPi-specific Container: *rtweed/qewd-server-rpi*