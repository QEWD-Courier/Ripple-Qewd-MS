# QEWD Courier

Email: <code.custodian@ripple.foundation>

2017-18 Ripple Foundation Community Interest Company 

[http://ripple.foundation](http://ripple.foundation)

Author: Rob Tweed, M/Gateway Developments Ltd (@rtweed)

# Docker / MicroService-based Ripple QEWD middleware

## Summary of the Helm Architecture

The Helm middle-tier environment consists of 5 MicroServices, each of which is a Dockerised instance of
[QEWD.js](https://qewdjs.com) that is customised to perform a specific task.  

The Helm middle-tier implements the REST APIs that are used by the Helm User Interface (UI) that is known as [PulseTile](https://github.com/PulseTile)

The MicroServices are as follows:

- *conductor* (folder *~/helm/conductor-service-phr*).  All incoming REST requests are channelled through this MicroService.  This MicroService does very little other than act as a router for incoming requests, forwarding them to the other MicroServices that handle them, and returning the responses from those MicroServices back to the user.  Some requests and responses are transformed, but most pass through the *conductor* MicroService unchanged.

- *authentication* (folder *~/helm/authentication-service-phr*).  This MicroService provides the interface to the authentication server, typically an OpenId Connect-based server.  In production systems, it is expected that this role will be provided by NHS Digital's Citizen Id service.  However, for testing and demonstration systems, it is recommended that you use the *openid_connect* MicroService that is included in this repository.

- *openid_connect* (also referred to as *oidc*) (folder *~/helm/openid-connect-server*).  This MicroService provides an OpenId Connect authentication service (based on the OpenId-certified [node-oidc-provider](https://github.com/panva/node-oidc-provider) module, integrated within a Dockerised instance of QEWD.js).  This MicroService has been designed to emulate the behaviour of NHS Digital's Citizen Id authentication service, allowing secure identity management by NHS Number.

- *openehr* (folder *~/helm/cdr-service-openehr*).  This MicroService provides the interface to the OpenEHR server that you will use for maintaining clinical information for registered users.  We suggest you use the Open Source [EtherCIS](https://github.com/ethercis) OpenEHR platform, but any platform that conforms to the OpenEHR specification can also be used.

- *discovery* (folder *~/helm/cdr-service-discovery*).  This MicroService provides the interface to the patient data repository provided by [Discovery Data Service](http://www.discoverydataservice.org).  In a production system, you will use the live HSCN-based version (ie available only to NHS sites).  For testing and demonstration, you should register for a subscription to their public-facing test/demonstration service.


The repository also includes the setup and configuration required for an [NGINX](https://www.nginx.com/) front-end to the MicroServices (folder *~/helm/DMZ*)


## Installation

Clone this repo into a folder named ~/helm on your host system, eg:

       git clone https://github.com/RippleOSI/Ripple-QEWD-Microservices ~/helm


## Install Docker

If you haven't already done so, install Docker on your host machine(s)

There are lots of instructions for doing this on the Internet, but
if your machine is running Ubuntu 18.04, invoke the following commands:

        sudo apt update
        sudo apt install apt-transport-https ca-certificates curl software-properties-common
        curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
        sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu bionic stable"
        sudo apt update
        apt-cache policy docker-ce
        sudo apt install docker-ce

To check that it's working, try:

        sudo systemctl status docker

To avoid having to use sudo with the docker commands:

        sudo usermod -aG docker ${USER}
        su - ${USER}

You'll be prompted for your password when invoking the second command above



## Configuration


### 1. Define the IP addresses or domain names of the MicroService Containers

These are defined in the file:

      ~/helm/settings/configuration.json

This file is read and used by all the Helm MicroServices when they start up.

It is recommended that you don't change the suggested ports unless you need to, in which case you'll need to make corresponding changes to the commands that start each MicroService.

Note 1: The *conductor* and *openid_connect* services are externally-facing and should be accessed via SSL

Note 2: External access will be proxied via nginx (see later)

Note 3: On cloud machines, the *authentication*, *openehr* and *discovery* services often require use of an IP address that is local to the subnet on which it resides: these addresses are the ones that the *conductor* service uses to connect to them.  However, the *conductor* and *openId_connect* host names should be the appropriate externally-facing IP address or domain name by which the PulseTile UI can connect to them.


Example on a local VM:

      "phr": {
        "microservices": {
          "conductor": {
            "host": "https://192.168.1.67",
            "port": 443
          },
          "authentication": {
            "host": "http://192.168.1.67",
            "port": 8001
          },
          "openehr": {
            "host": "http://192.168.1.67",
            "port": 8003
          },
          "discovery": {
            "host": "http://192.168.1.67",
            "port": 8004
          },
          "openid_connect": {
            "host": "https://192.168.1.67",
            "port": 443,
            "path_prefix": "/oidc"
          }
        }
      }

### 2. Two Factor Authentication

By default, the Helm repository has Two Factor Authentication disabled.  To enable it, edit the configuration file:

      ~/helm/settings/configuration.json

and look for this property:

      use2FA: false,

Either remove this line or set its value to *true*, and re-save the configuration file.


### 3. Configure Twilio

*If Two Factor Authentication is disabled, you can ignore this section.*

[Twilio](https://www.twilio.com/) is used by the Helm middle-tier for Two-Factor authentication via Mobile Phone text messaging.  It is mainly used in the *openid_connect* MicroService, but any management utilities provided in the other MicroServices also rely on this service to ensure that their use is secure.

Therefore, to use the Helm middle tier you will need to register with Twilio for an account that allows you to send text messages to your users' mobile phones.

Your Twilio registration credentials must be added to the file:

      ~/helm/settings/configuration.json

ie replace the values in this section:

     "twilio": {
       "accountSid": "xxxxxxxxxxxxxxxxxxxxxxxxxxx",
       "authToken": "yyyyyyyyyyyyyyyyyyyyyyyyyy",
       "telNo": "+447449000000"
     }


### 4. Configure your Mail Server

*If Two Factor Authentication is disabled, you can ignore this section.*

An email server is required for sending user authorisation/validation emails at user sign-up time

At the Ripple Foundation we use [MailGun](https://www.mailgun.com/), but there are other options available.

The Dockerised QEWD.js-based MicroServices make use of the widely-used Node.js [NodeMailer](https://nodemailer.com) module for sending emails.  The NodeMailer-compatible properties for your email service must be entered into the email_server property in 

      ~/helm/settings/configuration.json

ie replace the values in this section as appropriate:

     "email_server": {
       "host": "smtp.eu.mailgun.org",
       "port": 465,
       "secure": true,
       "auth": {
         "user": "postmaster@mail.example.com",
         "pass": "xxxxxxxxxxxxxxxxxxxxxxxxxxx"
       }
     }


### 5. Change the shared JSON Web Token Secret

It is strongly recommended that you change the shared JSON Web Token (JWT) secret that is used by the Helm MicroServices for authenticating and signing the JWTs that flow between PulseTile and the Helm MicroServices.

The JWT Secret is defined in:

      ~/helm/settings/configuration.json

ie replace the value of the *secret* property in this section:

     "jwt": {
       "secret": "bd645d9e-6281-4a96-949a-b249f6ff3d97"
     }

The Secret value can be any string.  Ensure that you use a value that is not too short or easily-guessable.


### 6. Change the QEWD.js Management Passwords

Each MicroService folder includes a file named *startup_config.json* that tells the QEWD.js module how to configure itself when it starts up.  Unless you understand what you're doing, it is best to leave most of the settings in this file untouched.  However it is a good idea to change the first property: *managementPassword*

The *managementPassword* is used to access the QEWD-Monitor application for each MicroService. 

Change this value before you start up the MicroService.  If you want to change it thereafter, you must restart the MicroService for it to take effect.


### 7. Configure your OpenEHR Server

The *openehr* MicroService provides the interface to your OpenEHR server.  The configuration for this is specified in the file:

      ~/helm/cdr-service-openehr/useDefined.json

It’s pre-set to share use of an existing cloud-based test EtherCIS system:

    "openehr": {
      "ethercis": {
        "url": "http://46.101.81.30:8080",
        "username": "guest",
        "password": "guest",
        "platform": "ethercis"
      }
    }

but you can change these settings to use your own OpenEHR server.


### 7. Configure access to Discovery Data Service

You’ll need to get a trial / demo account with Discovery Data Service.  Enter your username & password into the fields in the Discovery MicroService configuration file:

      ~/helm/cdr-service-discovery/modules/ripple-cdr-discovery/src/hosts.js

ie modify the *username* and *password* values in this section:

      auth: {
        host:       'https://devauth.endeavourhealth.net',
        path:       '/auth/realms/endeavour/protocol/openid-connect/token',
        username:   'xxxxxxx',
        password:   'yyyyyyyyyyyyyyy',
        client_id:  'eds-data-checker',
        grant_type: 'password'
      }


## Install and Configure NGINX

NGINX acts as the main web server for Helm, and proxies access to the QEWD MicroServices.

### Installing NGINX

You'll find lots of instructions on how to install it on the Internet.

However, to install it on Ubuntu 18.04, simply run these two commands:

      sudo apt update
      sudo apt install nginx


Check that it's working using: 

      systemctl status nginx

### Configuring NGINX

Configure NGINX for use with Helm by replacing this file on your machine:

      /etc/nginx/nginx.conf

with the file that you'll find at:

      ~/helm/DMZ/etc/nginx/nginx.conf


Then add or replace the contents of the file:

      /etc/nginx/conf.d

with the file that you'll find at:

      ~/helm/DMZ/etc/nginx/conf.d

There’s just one file in that folder:  *default.conf* 


### Set up the Proxy Redirections for your System


Change ALL the proxy redirection IP addresses in:

      /etc/nginx/conf.d/default.conf

to match those used by your Helm MicroServices, eg change:

      proxy_pass http://192.168.55.11:8000;

to

      proxy_pass http://192.168.1.100:8000;


### Copy the Self-Signed certificates:

In order to access Helm over SSL (HTTPS), you will need the appropriate certificates.  One a test/demonstration system you can create your own Self-Signed versions: there are lots of instructions on the Internet on how to do this for NGINX.  

However, if you wish, you can make use of the Self-Signed certificates that are included in the repository. If you're happy that these will be satisfactory and adequate for your needs (bearing in mind the lack of inherent security that they will provide), then follow these steps:

If your system doesn’t already have the folder /etc/pki, create it copy in the contents of the folder:

       ~/helm/DMZ/etc/pki

Or, if */etc/pki* already exists, copy the files from: 

       ~/helm/DMZ/etc/pki

to corresponding sub-folders

To take effect you must restart nginx:

      sudo systemctl restart nginx



Copy the PulseTile UI files to the nginx Web Server root directory:

 ~/usr/share/nginx/html


## Running the Suite of MicroServices

*Note:* If you have previously installed and run QEWD Courier and have updated your version from
the Github repository, make sure you update your copy of the *rtweed/qewd-server* Docker Container.
You **MUST** be using the latest version!  To update it:

      docker pull rtweed/qewd-server

To start the Helm MicroServices, either run:

      source ~/helm/start.sh

or open the script file and invoke the commands within it manually, one by one.

To check that the MicroService Containers are running:

     docker ps

To view the log of each one

     docker logs -f {container-name}

where {container-name} is one of:

- conductor
- auth
- openehr
- discovery
- oidc

Note: when you start the first Helm MicroService for the first time, Docker will automatically download the container *rtweed/qewd-server* from the Docker Hub, which takes a couple of minutes depending on your network speed.


Everything should now be up and running.


## Configuring the OpenID Connect Server

Before being able to use PulseTile, you need to configure the OpenId Connect server for use with Helm.

When you first start the OpenId Connect Server, the appropriate Client and Claim for use with Helm is set up for you automatically.  All you need to do is create one or more users for your Helm service, as follows:

First, start up the OIDC Admin application:

      https://192.168.1.100/oidc-admin/index.html

Note: change the IP address / host name to match that of the NGINX web server for your system.

The first time you run this it needs you to create an initial Administrator user.  

Click the *Continue* button to commence this process

Then log in with the QEWD password for the *openid_connect* MicroService - unless you changed it earlier, it will be:

     pwd_oidc

You’ll now see a form where you can enter your details as a Administrator.

Note: You **must** provide a working mobile phone number, because this application uses it for Two Factor Authentication (if enabled).

Once you save the Administrator details you’ll be asked to log in again, using the new credentials.

<<<<<<< HEAD
If Two Factor Authentication is enabled, you�ll then be prompted to enter the 6 digit code that will have been sent to your mobile phone.  Enter the correct number.

You�ll now be presented with the main Admin Portal screen from which you can create and maintain Helm users.
=======
You’ll then be prompted to enter the 6 digit code that will have been sent to your mobile phone.

If you enter the correct number, you’ll be presented with the main Admin Portal screen.

You now need to create an *OpenId Connect Client* and also create an *OpenId Connect Claim* for use with Helm.  Here’s how to do each:

### Creating A Client

Click the Green **+** button that you’ll see at the far right-hand side of the *Clients* banner

Enter the following details:

- Client Id:                     foo
- Client secret:                 bar
- Redirect URI Path:             /api/auth/token
- Post-Logout Redirect URI Path: **Important**: Delete this so the field is empty

Click Save


### Creating A Claim

Click the *Claims* tab and the Green **+** button that you’ll see at the far right-hand side of the *Claims* banner

Enter the following details:

- Claim Id / Name:   openid
- List of Fields:    Enter the following into the textarea field, with each one separated by a line-feed:

      email
      nhsNumber
      firstName
      lastName
      mobileNumber
      dob
      vouchedBy

Click Save
>>>>>>> origin/master


## Creating and Maintaining Users

<<<<<<< HEAD
From within the main Admin Portal screen, click the *Users* tab  and the Green **+** button that you�ll see at the far right-hand side of the *Users* banner
=======
Finally, the last step before being able to use the Helm MicroServices is to create one or more users.  User maintenance takes place on the OpenId Connect service.  Once again you'll use the same *oidc-admin* application as you used above for creating the Client and Claim, ie:

      https://192.168.1.100/oidc-admin/index.html

Click the *Users* tab  and the Green **+** button that you’ll see at the far right-hand side of the *Users* banner
>>>>>>> origin/master

Enter your user’s details.  

<<<<<<< HEAD
**Important**: if you have enabled Two Factor Authentication, ensure that both the email account and mobile phone number are working and correctly-entered.  These will be used for validating the user�s account and for Two Factor Authentication respectively.

Note: the Mobile phone number must be entered with the correct country code at the start, eg +44 7771 987654.  Spaces within the number are optional.

After you click the Save button, you�ll see the user�s details in the Users table display.  
=======
**Important**: Ensure that both the email account and mobile phone number are working and correctly-entered.  These will be used for validating the user’s account and for Two Factor Authentication respectively.

Note: the Mobile phone number must be entered with the correct country code at the start, eg +44 7771 987654.  Spaces within the number are optional.

After you click the Save button, you’ll see the user’s details in the Users table display.  To the far right of the display, you’ll see three buttons, the first of which is an orange button with an Info triangle inside it.  Click this button to send the user an email for them to verify their email address.
>>>>>>> origin/master

if Two Factor Authentication is enabled, then to the far right of the display, you�ll see three buttons, the first of which is an orange button with an Info triangle inside it.  Click this button to send the user an email for them to verify their email address.  The new user will receive an email asking them to verify themselves by clicking a link within the email text.  When they do this, they will be directed to the OpenId Connect server which will return them a 6 digit temporary one-time password

The user can use this to log in to the Helm system.


## Logging In To Helm

The first time you log in you must use the 6-digit one-time password that you were given when you verified your details (see the previous section above).

To start the Helm PulseTile User Interface, just point your browser at the root path of NGINX on your server, eg:

     https://192.168.1.100


You should be re-directed to the OpenId Connect server and you should see the login screen.  Enter your registered email address and password.

Note: if Two Factor Authentication is **DISABLED**, enter the password: **password**

Accept the Terms and Conditions

If Two Factor Authentication is enabled, you'll be asked for the 6 digit number that will have been sent to your mobile phone

if Two Factor Authentication is enabled, and if this is the first time you logged in, you now have to set your permanent password.  It must be a mixture of upper and lower case characters and one or more numbers.

After a short delay, you’ll now see the main Helm screen come up with data for your NHS Number.  That data will have been mapped from test data on the Discovery Data Service.




# Other Useful Information about the Helm Middle Tier Architecture

## What is the ~/helm/yottadb Folder For?

Each MicroService is run as a Docker Container - this container uses the *qewd-server* Docker service which
includes not only an instance of QEWD, but also an instance of the [YottaDB](https://yottadb.com/) NoSQL database which is mainly
used for QEWD internal management and user Session management.  However, it is also used as a database for
the *authentication* and *openehr* and *openid_connect* MicroServices.  In order for such data to persist beyond the life-span of the 
Docker containers, the YottaDB database files are mapped to pre-initialised files in the *~/helm/yottadb* directory.

**Please do not** touch or change the files in this directory and its sub-directories.


## The OpenEHR Jumper Functionality

OpenEHR Jumper automates the fetching and updating of OpenEHR data, avoiding the need for hand-crafted
AQL and Flat JSON definitions.  Instead, OpenEHR Jumper just needs to know the name of each
OpenEHR Template that you're interested in using.

The OpenEHR Jumper configuration is already set up for you in the *openehr* MicroService.


## Stopping and Restarting the Helm MicroServices

You can use a variety of mechanisms for stopping the Ripple-QEWD MicroServices, for example:

- if a MicroService is running as a foreground Docker process (using the *-it* parameter), you
  can simply use *CTRL & C* to stop it

- you can use *sudo docker stop {pid}*.  Use *sudo docker ps* to discover the PIDs for your
  MicroServices.  Usually you only need to specify the first 3 characters of the PID

- you can use the QEWD Monitor application (see below) for the MicroService you want to shut down.  Click
  the red X button next to the Master process displayed in the Overview Screen.

Note: In order to minimise any risk of corruption of the YottaDB database, it is recommended that you shut down the MicroServices using the QEWD Monitor option above.  This ensures that
QEWD Worker process connections to YottaDB are cleanly shut down.

However, each QEWD.js Container ensures that the YottaDB database is correctly run-down when the Container starts, and recovers any data from the YottaDB Journal if any corruption is detected.

To re-start each MicroService, see the section **Running the Suite of MicroServices** above.


## The QEWD Monitor Application

Each Ripple-QEWD MicroService runs as a self-contained QEWD instance, and includes its own copy
of the QEWD Monitor application.

This is a browser-based application that is started using the URL path */{proxy-path}/qewd-monitor/index.html*

where {proxy_path} is an NGINX-interpreted path that routes the request to the appropriate MicroService.  These paths are as follows:

- **conductor**:      */qewd_conductor/*
- **authentication**: */qewd_auth/*
- **openid_connect**: */oidc/*
- **openehr**:        */qewd_openehr/*
- **discovery**:      */qewd_discovery/*


For example, to access the QEWD Monitor application for the *conductor* service, point your browser at:

       http://www.myserver.com/qewd_conductor/qewd-monitor/index.html

If you successfully enter the QEWD Management Password (see earlier for details of how this is defined/configured), you will now be presented with the Overview screen.

From the Overview screen you can:

- examine how QEWD is configured
- stop the MicroService by stopping the QEWD Master Process
- stop any or all of the QEWD Worker processes.  QEWD will automatically restart them on demand

Select the Document Store tab/option to view any persistent documents in the QEWD/YottaDB Database

Select the Sessions tab/option to view and optionally shut down any active QEWD user sessions.



## Shell Access to Each MicroService

It is sometimes useful, for system management reasons, to be able to gain shell access to a MicroService.  You can do this by invoking the command:

       docker exec -it {container-name} bash

where {container-name} is one of:

- conductor
- auth
- openehr
- discovery
- oidc

Once you have shell access, you can open the YottaDB interactive shell to view / maintain its Global Storage.  From the Container's intenal /opt/qewd folder, simply invoke the command:

      ./ydb

You should see the YottaDB interactive shell prompt:

      YDB>

To exit the YottaDB interactive shell, type:

      H{Enter}

To exit shell access to the Container, type:

      exit{Enter}

