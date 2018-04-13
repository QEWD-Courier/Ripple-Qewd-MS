# Ripple-QEWD-Microservices

Email: <code.custodian@ripple.foundation>

2017 Ripple Foundation Community Interest Company 

[http://ripple.foundation](http://ripple.foundation)

Author: Rob Tweed, M/Gateway Developments Ltd (@rtweed)

## PHR Conductor Service

This folder contains the code for the PHR Demo externally-facing server, known as the
*Conductor* service.  All requests from the PHR PulseTile User Interface are sent to this server which
forwards them to the appropriate MicroService(s) for execution. 

Start up this container as a foreground process using the *rtweed/qewd-server* Docker Container:

       sudo docker run -it --rm -p 8080:8080 -v ~/ripple/conductor-service-phr:/opt/qewd/mapped -v ~/ripple/conductor-service-phr/www:/opt/qewd/www rtweed/qewd-server



or, to run it as a daemon process:

       sudo docker run -d --rm -p 8080:8080 -v ~/ripple/conductor-service-phr:/opt/qewd/mapped -v ~/ripple/conductor-service-phr/www:/opt/qewd/www rtweed/qewd-server


Note 1: the -p parameter defines the port mapping, using the convention:

      -p {external port}:{internal port}

The *qewd-server* container always uses port 8080 internally.  

The external port is for you to define.  You MUST ensure that it is accessible from:

-  the browsers that will be used for the PHR PulseTile front-end by your users;
-  the Gov.UK Verify server when it needs to re-direct to your callback URL.  

Note: if you're using a Raspberry Pi (RPi), simply change the above Docker commands to use the RPi-specific Container: *rtweed/qewd-server-rpi*

The first time you run the container, it will be downloaded: allow a few minutes for this.  On subsequent 
startups, it will fire up immediately.


## The PHR Demo Application

Make sure you've started all the MicroServices used by the demo.

Start it in a browser using the URL:

      http://{{host-ip-address}}:{{external-port))/index.html

eg:

      http://www.myserver.com:8080/index.html

Click the button to start it up

When re-directed to the Gov.Verify sandbox, use the username/password:

      ivor1   / ivor1pass

