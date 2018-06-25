# Ripple-QEWD-Microservices

Email: <code.custodian@ripple.foundation>

2017-18 Ripple Foundation Community Interest Company 

[http://ripple.foundation](http://ripple.foundation)

Author: Rob Tweed, M/Gateway Developments Ltd (@rtweed)

## PHR Authentication Service

This folder contains the code for the PHR Demo Authentication Microservice, which provides the Ripple interface to the OpenId Connect-based NHS Digital Citizen Id Authentication Service

Start up this container as a foreground process using the *rtweed/qewd-server* Docker Container:

       sudo docker run -it --rm -p 8081:8080 -v ~/ripple/authentication-service-phr:/opt/qewd/mapped -v ~/ripple/yottadb/authentication:/root/.yottadb/r1.22_x86_64/g rtweed/qewd-server	


or, to run it as a daemon process:

       sudo docker run -d --rm -p 8081:8080 -v ~/ripple/authentication-service-phr:/opt/qewd/mapped -v ~/ripple/yottadb/authentication:/root/.yottadb/r1.22_x86_64/g rtweed/qewd-server	


Note 1: the -p parameter defines the port mapping, using the convention:

      -p {external port}:{internal port}

The *qewd-server* container always uses port 8080 internally.  

The external port is for you to define.  You MUST ensure that it is accessible from the PHR Conductor service
and matches with its ms-hosts.json configuration. 


Note 2: if you're using a Raspberry Pi (RPi), use the RPi-specific Container: *rtweed/qewd-server-rpi*

Note 3: You'll need to obtain an account on the Citizen Id service - you should contact NHS Digital for this.  Enter the client_id and client_secret that they will provide you with into the appropriate fields in the file 
*~/ripple/authentication-service-phr/userDefined-openid.json*


