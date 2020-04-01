# Deployment

This document outlines a number of number of steps and recommendations for
deploying and setting up Sledge in a hackathon.

Sledge is simply a a node app so there's a number of ways to host to host it.
The easiest is to give Sledge its own VPS, on a hosting provider such as AWS.

## Deployment Script

Sledge contains a deployment script specifically for Debian 9. If you have
a fresh debian 9 instance you can download and run the setup script as root

```
$ wget https://raw.githubusercontent.com/HackRU/sledge/master/tools/deploy-debian9.sh
$ vim deploy-debian9.sh
$ chmod +x deploy-debian9.sh
$ sudo ./deploy-debian9.sh
```

Although this script can be setup to not require interaction, we recommend
running it manually so you can watch the output and watch for any problems.
