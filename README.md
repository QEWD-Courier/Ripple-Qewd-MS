# Ripple-QEWD-Microservices

Email: <code.custodian@ripple.foundation>

2017-18 Ripple Foundation Community Interest Company 

[http://ripple.foundation](http://ripple.foundation)

Author: Rob Tweed, M/Gateway Developments Ltd (@rtweed)

# Refactor of Ripple QEWD middleware towards a Microservices Architecture

## Installation

Clone this repo into your host system:

       cd ~
       git clone https://github.com/RippleOSI/Ripple-QEWD-Microservices


## Install Docker

If you haven't already done so, install Docker on your host machine(s)

      sudo apt-get update
      sudo apt-get install docker.io

### Installing Docker on Raspberry Pi

      curl -sSL https://get.docker.com | sh

## Configuration

There are 2 things you'll need to change.

- The IP addresses of the MicroService machines.  These are defined in the file:


     ~/Ripple-QEWD-Microservices/primary/ms-hosts.json

  You'll find that it contains:

      {
        "authentication_service": "http://192.168.1.120:8081",
        "hospital_service": "http://192.168.1.120:8082",
        "phr_service": "http://192.168.1.120:8083"
      }

  Change the IP addresses for each service to the one you'll be using for each MicroService.  These can be on the same or different IP addresses, as you choose.  The one proviso is that the Primary server is able to communicate with the other microservices.

  Note that you can't use localhost / 127.0.0.1 as the IP address(es) in these definitions, since this will be interpreted as the local host / IP address of the Docker Container itself, rather than that of the host machine.

  Save your changes (keeping the file-name unchanged).


- The Callback URL for the Authentication Service.  This is defined in the file:

       ~/Ripple-QEWD-Microservices/authentication/userDefined.json

  You'll find that it contains the line:

      "callback_url": "http://www.mgateway.com:8080/phr/loggedIn.html",

  Change this URL to your own configuration's equivalent (for the Primary service), eg:

      "callback_url": "http://192.168.1.120:8080/phr/loggedIn.html",

  Save your changes (keeping the file-name unchanged).


## Running the Suite of MicroServices

- Start each one up: see the README file in each sub-directory for instructions.  Start with the
*/primary* MicroService.

- When all the MicroServices are running, start the browser application: see the README file in the */primary* folder.

