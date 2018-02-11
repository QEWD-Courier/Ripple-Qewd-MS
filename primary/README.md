# Ripple-QEWD-Microservices

Email: <code.custodian@ripple.foundation>

2017 Ripple Foundation Community Interest Company 

[http://ripple.foundation](http://ripple.foundation)

Author: Rob Tweed, M/Gateway Developments Ltd (@rtweed)

## Primary Service

This folder contains the code for the Leeds PHR Demo Primary externally-facing server

Start up this container as a foreground process using the *rtweed/qewd-server* Docker Container:

       sudo docker run -it -p 8080:8080 -v ~/Ripple-QEWD-Microservices/primary:/opt/qewd/mapped -v ~/Ripple-QEWD-Microservices/primary/www:/opt/qewd/www rtweed/qewd-server

or, to run it as a daemon process:

       sudo docker run -d -p 8080:8080 -v ~/Ripple-QEWD-Microservices/primary:/opt/qewd/mapped -v ~/Ripple-QEWD-Microservices/primary/www:/opt/qewd/www rtweed/qewd-server

Note: if you're using a Raspberry Pi (RPi), use the RPi-specific Container: *rtweed/qewd-server-rpi*

The first time you run the container, it will be downloaded: allow a few minutes for this.  On subsequent 
startups, it will fire up immediately.


## The PHR Demo Application

Make sure you've started all the MicroServices used by the demo.

Start it in a browser using the URL:

      http://{{host-ip-address}}:8080/index.html

eg:

      http://192.168.1.100:8080/index.html

Click the button to start it up

When re-directed to the Gov.Verify sandbox, use the username/password:

      ivor1   / ivor1pass
