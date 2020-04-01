# Deployment

This document outlines a number of number of steps and recommendations for
deploying and setting up Sledge in a hackathon.

Sledge is simply a a node app so there's a number of ways to host to host it.
The easiest is to give Sledge its own VPS, on a hosting provider such as AWS. An
easy solution is Amazon Lightsail.

## Deployment Script

Sledge contains a deployment script specifically for Debian 9. If you have
a fresh debian 9 instance you can download and run the setup script as root

```
$ wget https://raw.githubusercontent.com/HackRU/sledge/master/tools/deploy-debian9.sh
$ chmod +x deploy-debian9.sh
$ sudo ./deploy-debian9.sh
```

Although this script can be setup to not require interaction, we recommend
running it manually so you can watch the output and watch for any problems.

The script requires two variables, which will be asked if they are not passed
in.

 - `SLEDGE_SETUP_EMAIL`. This email is passed into certbot when requesting an
    SSL certificate. If cerbot is successful this email will be passed to
    Let's Encrypt and used to warn you when the certificate is about to expire.
    If this doesn't interest you, you can leave this blank.
 - `SLEDGE_SETUP_DOMAIN`. This value is also passed into certbot when requesting
    an SSL certificate and also used when generating the nginx configuration and
    is the domain given to the self-signed certificate. Although certbot accepts
    a comma-separated list of domain, this variable should have exactly one.
