#!/usr/bin/env bash
# This is meant to be run on a fresh debian 9 install. See Deployment page in docs
# for more details.

set -e -u

echo "========================================="
echo "== Welcome to the Sledge setup script! =="
echo "========================================="
echo
echo "This script is mean to be run on Debian 9. This script does not check"
echo "if it is actually running on Debian 9, and will fail in unexpected ways"
echo "if it is not. This script is should not be run more than once."
echo
[[ ! -z "${SLEDGE_SETUP_NOPAUSE:-}" ]] || {
  echo "Press enter to continue."
  read
}
[[ ! -z "${SLEDGE_SETUP_EMAIL:-}" ]] || {
  echo "Please enter the value you want for SLEDGE_SETUP_EMAIL."
  read SLEDGE_SETUP_EMAIL
}
[[ ! -z "${SLEDGE_SETUP_DOMAIN:-}" ]] || {
  echo "Please enter the value you want for SLEDGE_SETUP_DOMAIN."
  read SLEDGE_SETUP_DOMAIN
}
[[ ! -z "${SLEDGE_SETUP_USERNAME:-}" ]] || {
  echo "Please enter the value you want for SLEDGE_SETUP_USERNAME."
  read SLEDGE_SETUP_USERNAME
}
[[ ! -z "${SLEDGE_SETUP_PASSWORD:-}" ]] || {
  echo "Please enter the value you want for SLEDGE_SETUP_PASSWORD."
  read SLEDGE_SETUP_PASSWORD
}

echo
echo "This script will perform the following actions:"
echo '1.  Fully upgrade all packages (apt update && apt dist-upgrade)'
echo '2.  Add the nodejs and yarn repositories to sources.list and install the'
echo '    latest version of each'
echo '3.  Install nginx and other packages necessary for later steps'
echo '4.  Request an SSL certificate for the given domain via Lets Encrypt'
echo '5.  Setup iptables rules to block inbound TCP requests except on ports'
echo '    for HTTP,HTTPS and SSH'
echo '6.  Save the creates iptables rules to be persistent on reboot'
echo '7.  Create and enable a 1GB swapfile, and save to fstab to its persistent'
echo '    on reboot'
echo '8.  Create a system user sledge'
echo '9.  Clone and build sledge as the new user from the home directory'
echo '10. Create and enable a systemd service to run sledge on port 4000'
echo '11. Create a self-signed SSL certificate for the given domain'
echo '12. Create and an nginx site to server sledge, using the generated'
echo '    certificate from either step 4 or step 11 depending on if step 4 was'
echo '    successful'
echo '13. Enable the created nginx site and disable the default site'
echo '14. Print a message indicating success. If the script exits without such '
echo '    message, it has not completed successfully and manual intervention'
echo '    might be required to fix'
echo
echo "SLEDGE_SETUP_EMAIL = $SLEDGE_SETUP_EMAIL"
echo "SLEDGE_SETUP_DOMAIN = $SLEDGE_SETUP_DOMAIN"
echo "SLEDGE_SETUP_USERNAME = $SLEDGE_SETUP_USERNAME"
echo "SLEDGE_SETUP_PASSWORD = $SLEDGE_SETUP_PASSWORD"
echo
[[ ! -z "${SLEDGE_SETUP_NOPAUSE:-}" ]] || {
  echo "Press enter to continue."
  read
}

export DEBIAN_FRONTEND=noninteractive

# Initial Update
apt-get -y update
apt-get -y dist-upgrade

# Add external repos
apt-get -y install apt-transport-https lsb-release
curl -sL https://deb.nodesource.com/setup_13.x | bash -
curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add -
echo "deb https://dl.yarnpkg.com/debian/ stable main" >/etc/apt/sources.list.d/yarn.list

# Update repos and install additional packages
apt-get -y update
apt-get -y install curl nodejs yarn build-essential git sudo certbot nginx xxd sqlite3 iptables-persistent apache2-utils

# nginx automatically starts when it's installed, we don't want that yet
service nginx stop

# If possible, get SSL certificates
certbot certonly -n --standalone --agree-tos --email "$SLEDGE_SETUP_EMAIL" --domains "$SLEDGE_SETUP_DOMAIN" || {
  echo "================================================"
  echo "===== WARNING: Could not get certificates! ====="
  echo "================================================"
  echo "The server will continue to be created with a self-signed certificate"
  echo
}

# Setup iptables to block most incoming connections,
# after first deleting the current config
#  Note: We don't care about FORWARD, and we leave INPUT as accept until the
#  other rules are there
iptables -P INPUT ACCEPT
iptables -F INPUT
iptables -P OUTPUT ACCEPT
iptables -F OUTPUT
iptables -A INPUT -i lo -j ACCEPT
iptables -A INPUT -m conntrack --ctstate ESTABLISHED,RELATED -j ACCEPT
iptables -A INPUT -p tcp --match multiport --dports 22,80,443 -j ACCEPT
iptables -P INPUT DROP
iptables-save >/etc/iptables/rules.v4

# Sledge, particularly the build process, should have at least 1GB of RAM.
# Although our delpoyment server *should* be equipped with much more, we create
# a swapfile to prevent nasty EOMs that are difficult to track down.
if [ ! -f /swapfile ]; then
  dd if=/dev/zero of=/swapfile bs=1024 count=1000000
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  /bin/echo -e '/swapfile\tnone\tswap\tsw\t0\t0' >>/etc/fstab
fi

# Create user for sledge
useradd -mr sledge

# Setup and build Sledge
sudo -u sledge sh - <<EOF
cd \$HOME
git clone https://github.com/HackRU/sledge.git sledge
cd sledge
git checkout fall2018

yarn install
BUILD_MODE=prod make build
EOF

# Add and enable sledge service
tee /lib/systemd/system/sledge.service <<EOF
[Unit]
Description=A Judging System for Hackathons

[Service]
ExecStart=/home/sledge/sledge/bin/sledge --port 4000
Environment='DEBUG=sledge'
User=sledge
WorkingDirectory=/home/sledge/sledge
Restart=on-failure

[Install]
Alias=sledge.service
WantedBy=multi-user.target
EOF
systemctl enable sledge.service
systemctl start sledge.service
sleep 3 # Wait for Sledge to fully start

# Sledge ssl certificate
mkdir -p /etc/nginx/ssl
ln -s "/etc/letsencrypt/live/$SLEDGE_SETUP_DOMAIN/privkey.pem" /etc/nginx/ssl/sledge.key
ln -s "/etc/letsencrypt/live/$SLEDGE_SETUP_DOMAIN/fullchain.pem" /etc/nginx/ssl/sledge.cert
tee /etc/nginx/snippets/ssl-sledge <<EOF
ssl_certificate /etc/nginx/ssl/sledge.cert;
ssl_certificate_key /etc/nginx/ssl/sledge.key;
EOF

# Self-signed certificate
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/nginx/ssl/nginx.key -out /etc/nginx/ssl/nginx.cert \
  -subj "/CN=$SLEDGE_SETUP_DOMAIN"
tee /etc/nginx/snippets/ssl-nginx <<EOF
ssl_certificate /etc/nginx/ssl/nginx.cert;
ssl_certificate_key /etc/nginx/ssl/nginx.key;
EOF

# Choose which certificate, based on if we got the certificate
if [ -d "/etc/letsencrypt/live/sledge.site" ]; then
  SSL_SNIPPET="snippets/ssl-sledge"
else
  SSL_SNIPPET="snippets/ssl-nginx"
fi

# Setup HTTP Auth file
htpasswd -b -c /etc/nginx/sledge.htpasswd "$SLEDGE_SETUP_USERNAME" "$SLEDGE_SETUP_PASSWORD"

# Add nginx config for website
tee /etc/nginx/sites-available/sledge <<EOF
server {
  listen 443 ssl;
  listen [::]:443 ssl;

  server_name $SLEDGE_SETUP_DOMAIN;

  include $SSL_SNIPPET;

  root /var/www/html;
  index index.html;

  location /socket.io {
    auth_basic "Sledge Privileged Area";
    auth_basic_user_file /etc/nginx/sledge.htpasswd;

    proxy_set_header Upgrade \$http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_http_version 1.1;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header Host \$host;
    proxy_pass http://localhost:4000;
  }

  location / {
    root /home/sledge/sledge/public;
  }
}

server {
  listen 80;
  listen [::]:80;

  server_name $SLEDGE_SETUP_DOMAIN;

  return 301 https://$SLEDGE_SETUP_DOMAIN\$request_uri;
}
EOF
ln -s /etc/nginx/sites-available/sledge /etc/nginx/sites-enabled/sledge
rm -f /etc/nginx/sites-enabled/default

# Start nginx
nginx -t
systemctl start nginx

# Finish message
echo "============================"
echo "== Sledge Setup Complete! =="
echo "============================"
echo "The setup script has finished installing Sledge. Please see documentation for what to do next."
