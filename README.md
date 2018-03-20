# Ripple-QEWD-Microservices

Email: <code.custodian@ripple.foundation>

2017-18 Ripple Foundation Community Interest Company 

[http://ripple.foundation](http://ripple.foundation)

Author: Rob Tweed, M/Gateway Developments Ltd (@rtweed)

# Docker / MicroService-based Ripple QEWD middleware

## Installation

Clone this repo into your host system:

       cd ~
       git clone https://github.com/RippleOSI/Ripple-QEWD-Microservices

Rename the directory that is created, to, eg: "ripple":

       mv ~/Ripple-QEWD-Microservices ~/ripple


## Install Docker

If you haven't already done so, install Docker on your host machine(s)

      sudo apt-get update
      sudo apt-get install docker.io

### Installing Docker on Raspberry Pi

      curl -sSL https://get.docker.com | sh

### Installing Docker on Windows

  See [the Docker instructions](https://docs.docker.com/docker-for-windows/install/)

## Configuration

There are 3 things you'll need to change.

### 1. The IP addresses of the MicroService machines

These are defined in the *ms-hosts.json* file of the
two Conductor services.  Here's what to do:

#### PHR Conductor Configuration

In the file:


     ~/ripple/conductor-service-phr/ms-hosts.json

  You'll find that it contains:

      {
        "authentication_service": "http://192.168.1.193:8081",
        "mpi_service": "http://192.168.1.193:8082",
        "cdr_openehr_service": "http://192.168.1.193:8083"
      }


  Change the IP addresses for each service to the one you'll be using for each MicroService.  These can be on the same or different IP addresses - it's up to you how you physically configure each MicroService.  The one proviso is that the PHR Conductor server is able to communicate with the other microservices via the IP addresses / ports you specify.

  Note 1: You can't use localhost / 127.0.0.1 as the IP address(es) in these definitions, since this will be interpreted as the local host / IP address of the Docker Container itself, rather than that of the host machine.

  Note 2: The Authentication services (ie Gov.UK Verify) needs to be able to re-direct back
  to your PHR Conductor server, so the server on which your PHR Conductor server runs must be accessible
  from the Internet via the domain name and port you specify.

  Save your changes (keeping the file-name unchanged).


#### IDCR Conductor Configuration

In the file:

     ~/ripple/conductor-service-idcr/ms-hosts.json

  You'll find that it contains:

      {
        "authentication_service": "http://192.168.1.193:8085",
        "mpi_service": "http://192.168.1.193:8082",
        "cdr-openehr-service": "http://192.168.1.193:8083"
      }

  Change the IP addresses for each service to the one you'll be using for each MicroService.  These can be on the same or different IP addresses - it's up to you how you physically configure each MicroService.  The one proviso is that the IDCR Conductor server is able to communicate with the other microservices via the IP addresses / ports you specify.

  Note 1: You can't use localhost / 127.0.0.1 as the IP address(es) in these definitions, since this will be interpreted as the local host / IP address of the Docker Container itself, rather than that of the host machine.

  Note 2: The Authentication services (ie Auth0) needs to be able to re-direct back
  to your IDCR Conductor server, so the server on which your IDCR Conductor server runs must be accessible
  from the Internet via the domain name and port you specify.

  Save your changes (keeping the file-name unchanged).


### 2. The Configuration Parameters for the PHR Authentication Service


These are defined in the file:

       ~/ripple/authentication-service-phr/userDefined-openid.json

#### Account Details

  You'll need to define correct values for the following two parameters:


      "client_id": "xxxxxxxxxx",
      "client_secret": "yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy",

  Contact us for the Gov.UK Verify sandbox credentials

#### Callback URL


  You'll need to redefine this line:

      "callback_url": "http://www.mgateway.com:8080/phr/loggedIn.html",

  Change this URL an external-facing, publicly-accessible address for your own PHR Conductor service, eg:

      "callback_url": "http://my.server.com:8080/phr/loggedIn.html",

  Important: the Gov.UK Verify service MUST be able to redirect to your PHR Conductor Micro-Service, so
  the domain name/port you specify must be publicly-accessible from the Internet.

  Save your changes (keeping the file-name unchanged).


### 3. The Configuration Parameters for the IDCR Authentication Service


This assumes you'll be using an Auth0 account, and the credentials are defined in the file:

       ~/ripple/authentication-service-idcr/userDefined-auth0.json

#### Account Details

  You'll need to define correct values for the following three parameters:


      "domain": "xxx.eu.auth0.com",
      "client_id": "yyyyyyyyyyyyyyyyyyyyyyyyyy",
      "client_secret": "zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz",

  These will be available via your Auth0 account


#### Callback URL


  You'll need to redefine this line:

       "callback_url": "http://www.mgateway.com:8084/api/auth/token",

  Change this URL an external-facing, publicly-accessible address for your own IDCR Conductor service, eg:

      "callback_url": "http://my.server.com:8082/api/auth/token",

  Important: the Auth0 service MUST be able to redirect to your IDCR Conductor Micro-Service, so
  the domain name/port you specify must be publicly-accessible from the Internet.

  Note: the Callback URL must also be registered in your Client Configuration in your Auth0 account.

  Save your changes (keeping the file-name unchanged).


## What is the /yottadb Directory For?

Each MicroService is run as a Docker Container - this container uses the *qewd-server* Docker service which
includes not only an instance of QEWD, but also an instance of the YottaDB NoSQL database which is mainly
used for QEWD internal management and user Session management.  However, it is also used as a database for
the *authentication-service-phr* MicroService.  In order for such data to persist beyond the life-span of the 
Docker container, the YottaDB database files are mapped to pre-initialised files in the */yottadb* directory.

Please don't touch or change the files in this directory and its sub-directories.

Note, when the *authentication-service-phr* MicroService is shut down, the files in this directory
can be copied / backed up if required.


## Running the Suite of MicroServices

- Start each one up: see the README file in each sub-directory for instructions.  Start with the
*/conductor-service-phr* MicroService.  You can start them in any sequence you wish.

- When all the MicroServices are running, start the browser application: see the README file in the */conductor-service-phr* folder.



