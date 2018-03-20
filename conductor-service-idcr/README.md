# Ripple-QEWD-Microservices

Email: <code.custodian@ripple.foundation>

2017 Ripple Foundation Community Interest Company 

[http://ripple.foundation](http://ripple.foundation)

Author: Rob Tweed, M/Gateway Developments Ltd (@rtweed)

## IDCR Conductor Service

This folder contains the code for the Ripple IDCR System externally-facing server, known as the
*Conductor* service.  All requests from the PulseTile User Interface are sent to this server which
forwards them to the appropriate MicroService(s) for execution. 

Start up this container as a foreground process using the *rtweed/qewd-server* Docker Container:

       sudo docker run -it -p 8084:8080 -v ~/ripple/conductor-service-idcr:/opt/qewd/mapped -v ~/ripple/conductor-service-idcr/www:/opt/qewd/www rtweed/qewd-server


or, to run it as a daemon process:

       sudo docker run -d -p 8084:8080 -v ~/ripple/conductor-service-idcr:/opt/qewd/mapped -v ~/ripple/conductor-service-idcr/www:/opt/qewd/www rtweed/qewd-server


Note 1: the -p parameter defines the port mapping, using the convention:

      -p {external port}:{internal port}

The *qewd-server* container always uses port 8080 internally.  

The external port is for you to define.  You MUST ensure that it is accessible from:

-  the browsers that will be used for the PulseTile front-end by your users;
-  the Auth0 server when it needs to re-direct to your callback URL.  

Note: if you're using a Raspberry Pi (RPi), simply change the above Docker commands to use the RPi-specific Container: *rtweed/qewd-server-rpi*

The first time you run the container, it will be downloaded: allow a few minutes for this.  On subsequent 
startups, it will fire up immediately.


