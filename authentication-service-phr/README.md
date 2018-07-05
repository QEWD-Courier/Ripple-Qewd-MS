# Ripple-QEWD-Microservices

Email: <code.custodian@ripple.foundation>

2017-18 Ripple Foundation Community Interest Company 

[http://ripple.foundation](http://ripple.foundation)

Author: Rob Tweed, M/Gateway Developments Ltd (@rtweed)

## PHR Authentication Service

This folder contains the code for the PHR Demo Authentication Microservice, which provides the Ripple interface to an OpenId Connect Authentication service.  

Production systems are expected to use the NHS Digital Citizen Id Authentication Service, but this MicroService is pre-configured to use a local OpenId Connect Authentication Container (*openid-connect-server*) which you can use for local testing and/or evaluation.  This local service, though without the NHS Digital Citizen Id branding and styling, will behave identically to the Citizen Id service, and has the advantage that you can create and maintain your own database of users.


## Configuring the MicroService to use the Local OpenId Connect Container.

Edit the text file
 *~/ripple/authentication-service-phr/userDefined-openid.json*

1) Everywhere you see *http://192.168.1.135:8000*, change this to match the IP address and port on which you're running the *conductor-service-phr* MicroService

2) Everywhere you see *http://192.168.1.135:8080*, change this to match the IP address and port on which you run the local *openid-connect-server* Container.


## Starting the MicroService

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

Note 3: For production systems, you'll need to reconfigure the MicroService to use the NHS Digital Citizen Id Service.  First, obtain an account on the Citizen Id service - you should contact NHS Digital for this.  Then, enter the *client_id* and *client_secret* that they will provide you with into the appropriate fields in the file 
*~/ripple/authentication-service-phr/userDefined-openid.json.cid*

After editing it, rename the file to *userDefined-openid.json* and restart the MicroService.
