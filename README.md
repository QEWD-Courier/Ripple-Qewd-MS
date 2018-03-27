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

## The OpenEHR Jumper Functionality

OpenEHR Jumper automates the fetching and updating of OpenEHR data, avoiding the need for hand-crafted
AQL and Flat JSON definitions.  Instead, OpenEHR Jumper just needs to know the name of each
OpenEHR Template that you're interested in using.

For details on how to configure, initialise and use the OpenEHR Jumper technology, see the README file
in the */cdr-service-openehr* folder.


### Running the PHR as a patient / individual user

In this mode of operation, once you are logged in, you will only be able to access information
for your registered NHS Number, and you won't have access to any other information for any other
patient or individual.

Point a browser at the URL path */* or */index.html* on the server running the PHR Conductor MicroService.

For example, if you started the PHR Conductor MicroService on *www.myserver.com*, exposed via port 8080, 
you would point the browser at:

       http://www.myserver.com:8080/index.html

or simply:

       http://www.myserver.com:8080

You will be immediately redirected to the Gov.UK Verify authentication server where you will need
to provide a valid username and password.

If the *authentication-service-phr* MicroService is configured to use the Gov.UK Verify sandbox, use
the test / demo user:

      username: ivor1
      password: ivor1pass


### Running the Full IDCR system as a patient / individual user

In this mode of operation, once you are logged in, you will only be able to access information
for your registered NHS Number, and you won't have access to any other information for any other
patient or individual.

Point a browser at the URL path */* or */index.html* on the server running the IDCR Conductor MicroService.

For example, if you started the IDCR Conductor MicroService on *www.myserver.com*, exposed via port 8084, 
you would point the browser at:

       http://www.myserver.com:8084/index.html

or simply:

       http://www.myserver.com:8084

You will be immediately redirected to the Auth0 authentication server where you will need
to provide a valid username and password.


### Running the PHR and IDCR versions as an IDCR user

In this mode of operation, once you are logged in, you will be able to access information
for any NHS Number that you have been authorised to see and maintain.

Note: In the current demo system, you'll be automatically authorised to access all NHS Numbers in the
simulated PAS.

This mode of operation uses an IDCR User administration sub-system that is included with the
*authentication-service-phr* MicroService

To run the PHR and/or IDCR versions as an IDCR user, point a browser at the URL 
path */ripple-admin/index.html* on the server running the PHR Conductor MicroService.

For example, if you started the PHR Conductor MicroService on *www.myserver.com*, exposed via port 8080, 
you would point the browser at:

       http://www.myserver.com:8080/ripple-admin/index.html

#### First Time Configuration

If you have started up a new installation of the Ripple-QEWD-MicroServices system for the first time, 
then you will be asked to create an initial administrator username.  To prevent unauthorised use
of this facility, you must enter the QEWD Management Password for the PHR Conductor MicroService.

You'll find this password in the file:

     ~/ripple/conductor-service-phr/startup_config.json

Note 1: It is recommended that you modify this password.  If you do, you'll need to restart the
PHR Conductor MicroService.

Note 2: All the Ripple-QEWD MicroServices have a version of this file, each with the same initial
value for the QEWD Management Password.  You should modify the password in each copy of the 
*startup_config.json* file.  It's up to you whether you use the same or different passwords in
each MicroService.

If you correctly entered the QEWD Management Password when asked, you will be presented with
a form in which you create the first IDCR User.  This user will also automatically be given
Administrator rights, which means that this user can subsequently create more IDCR and/or
Administrator users (Note: an Admininstrator user also has IDCR User rights, but not *vice versa*).

On successful submission of the IDCR/Administrator user form, you will next be asked to
login using that new user's username and password.  See below to continue:


#### Subsequent Logins

If at least one Administrator user has been created, each time you point a browser at the
*/ripple-admin/index.html* URL, you will be asked to login using your IDCR user's username
and password.

On successful login, you will see two buttons:

- one redirecting you to the PHR version as an IDCR user
- one redirecting you to the full IDCR version as an IDCR user

If your username also has Administrator rights, you'll also see a form in which you can create a 
new IDCR or Administrator User.


## JSON Web Tokens used by Ripple QEWD's MicroServices

Internal authentication of messaging between the various Ripple QEWD MicroServices is done using
JSON Web Tokens (JWTs).  These are created and maintained by QEWD itself and by the Ripple-QEWD
application message handlers.

In order that all the MicroServices can sign and authenticate each others' JWTS, all the MicroServices
share a common JWT secret.  Look for the file *jwt_secret.json* in each MicroService directory, eg:

      ~/ripple/conductor-service-phr/jwt_secret.json

It is recommended that you change the value in the copy of this file in all the Ripple-QEWD
MicroService directories.  Note:

- the value MUST be the same in every instance of this file
- you can use any alphanumeric value you wish, but make sure that it cannot be guessed

It is also recommended that you change the JWT secret on a regular basis.

If you change the JWT Secret of a MicroService, you must restart it in order for it to take effect.


## Stopping and Restarting the Ripple-QEWD MicroServices

You can use a variety of mechanisms for stopping the Ripple-QEWD MicroServices, for example:

- if a MicroService is running as a foreground Docker process (using the *-it* parameter), you
  can simply use *CTRL & C* to stop it

- you can use *sudo docker stop {pid}*.  Use *sudo docker ps* to discover the PIDs for your
  MicroServices.  Usually you only need to specify the first 3 characters of the PID

- you can use the QEWD Monitor application (see below) for the MicroService you want to shut down.  Click
  the red X button next to the Master process displayed in the Overview Screen.

Note: In order to prevent corruption of the YottaDB database that is used for IDCR / Administrator
user registration and authentication, it is recommended that you shut down the
*authentication-service-phr* MicroService using the QEWD Monitor option above.  This ensures that
QEWD Worker process connections to YottaDB are cleanly shut down.

To re-start each MicroService, see the README files in the MicroService folders in this repository.


## The QEWD Monitor Application

Each Ripple-QEWD MicroService runs as a self-contained QEWD instance, and includes its own copy
of the QEWD Monitor application.

This is a browser-based application that is started using the URL path */qewd-monitor/index.html*

For example, if you started the IDCR Conductor MicroService on *www.myserver.com*, exposed via port 8084, 
you would access its QEWD Monitor application by pointing the browser at:

       http://www.myserver.com:8084/qewd-monitor/index.html


You will be asked to enter the QEWD Management Password.  You'll find this password in the file
named *startup_config.json* within each MicroService directory.  For example:

     ~/ripple/conductor-service-phr/startup_config.json

Note 1: It is recommended that you modify this password.  If you do, you'll need to restart the
PHR Conductor MicroService.

Note 2: All the Ripple-QEWD MicroServices have a version of this file, each with the same initial
value for the QEWD Management Password.  You should modify the password in each copy of the 
*startup_config.json* file.  It's up to you whether you use the same or different passwords in
each MicroService.



If you successfully entered the QEWD Management Password, you will now be presented with the
Overview screen.

From the Overview screen you can:

- examine how QEWD is configured
- stop the MicroService by stopping the QEWD Master Process
- stop any or all of the QEWD Worker processes.  QEWD will automatically restart them on demand

Select the Document Store tab/option to view any persistent documents in the QEWD/YottaDB Database

Select the Sessions tab/option to view and optionally shut down any active QEWD user sessions.
