# Ripple-QEWD-Microservices

Email: <code.custodian@ripple.foundation>

2017-18 Ripple Foundation Community Interest Company 

[http://ripple.foundation](http://ripple.foundation)

Author: Rob Tweed, M/Gateway Developments Ltd (@rtweed)

## Local OpenId Connnect Server

This folder contains the code for an optional QEWD-based Docker Container that you may use to implement a local OpenId Connect Authentication service.  This can be used to provide an alternative to the NHS Digital Citizen Id service that you would use for a production system.  

Although branded and styled differently from Citizen Id, it behaves identically and allows you control over the user database which is useful during testing and evaluation.

It can also be used as a fully-fledged OpenId Connect Authentication server for other projects.

The *openid-connect-server* Container is based on the Node.js-based OpenID-certified 
[*oidc-provider*](https://github.com/panva/node-oidc-provider) module, created and maintained by 
Filip Skokan.  It has been integrated into a QEWD server environment to provide it with access to QEWD's integrated database for maintaining configuration and user information. 


# Configuring the OpenID Connect Server

Before you start the Container, you need to do a bit of configuring which simply involves editing some of the files within this folder.

1) Look for the file *oidc-config.json*  (eg *~/ms/openid-connect-server/oidc-config.json*)

  Change the IP address to match the one you'll be running it on

  You can change the port, but I'd recommend you leave it as 8080 for now.

2) Look for the file *documents.json*  (eg *~/ms/openid-connect-server/documents.json*)

  Change the IP address (*192.168.1.135*) in the Client *redirect_uris* and *post_logout_redirect_uris* properties to match the IP address of the machine on which you're running the *conductor-service-phr* MicroService.

  You can change the port, but I'd recommend you leave it as 8000 for now and run the *conductor-service-phr* MicroService on that port until you're familiar with how this architecture works.

3) While looking at the *documents.json* file, you'll see that two users have been set up for you.  If you want to define more users, follow the pattern you see in this section of the file.

If you change the *documents.json* file later you'll need to restart the Container for the changes to take effect.


4) Make sure you correctly configure the *authentication-service-phr* MicroService so that it points correctly to your local OpenId Connect service.  See the README file in that MicroService folder for instructions.


# Starting the OpenId Connect Server

Start up this container as a foreground process using the *rtweed/qewd-server* Docker Container:

       sudo docker run -it --rm -p 8080:8080 -v ~/ms/openid-connect-server:/opt/qewd/mapped rtweed/qewd-server

or, to run it as a daemon process:

       sudo docker run -d --rm -p 8080:8080 -v ~/ms/openid-connect-server:/opt/qewd/mapped rtweed/qewd-server


Note 1: the -p parameter defines the port mapping, using the convention:

      -p {external port}:{internal port}

The *qewd-server* container always uses port 8080 internally.  



Note 1: if you're using a Raspberry Pi (RPi), use the RPi-specific Container: *rtweed/qewd-server-rpi*


