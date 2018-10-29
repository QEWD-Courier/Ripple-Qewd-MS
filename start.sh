#!/usr/bin/env bash

sudo docker run -d --rm --name conductor -p 8000:8080 -v ~/helm/conductor-service-phr:/opt/qewd/mapped -v ~/helm/conductor-service-phr/www:/opt/qewd/www -v ~/helm/settings:/opt/qewd/mapped/settings -v ~/helm/yottadb/conductor:/root/.yottadb/r1.22_x86_64/g rtweed/qewd-server

sudo docker run -d --rm --name auth -p 8001:8080 -v ~/helm/authentication-service-phr:/opt/qewd/mapped -v ~/helm/authentication-service-phr/www:/opt/qewd/www -v ~/helm/yottadb/authentication:/root/.yottadb/r1.22_x86_64/g -v ~/helm/settings:/opt/qewd/mapped/settings rtweed/qewd-server

sudo docker run -d --rm --name openehr -p 8003:8080 -v ~/helm/cdr-service-openehr:/opt/qewd/mapped -v ~/helm/cdr-service-openehr/www:/opt/qewd/www -v ~/helm/yottadb/openehr:/root/.yottadb/r1.22_x86_64/g -v ~/helm/settings:/opt/qewd/mapped/settings rtweed/qewd-server

sudo docker run -d --rm --name discovery -p 8004:8080 -v ~/helm/cdr-service-discovery:/opt/qewd/mapped -v ~/helm/cdr-service-discovery/www:/opt/qewd/www -v ~/helm/settings:/opt/qewd/mapped/settings rtweed/qewd-server

sudo docker run -d --rm --name oidc -p 8080:8080 -v ~/helm/openid-connect-server:/opt/qewd/mapped -v ~/helm/openid-connect-server/www:/opt/qewd/www -v ~/helm/settings:/opt/qewd/mapped/settings -v ~/helm/yottadb/openid-connect-server:/root/.yottadb/r1.22_x86_64/g rtweed/qewd-server 
