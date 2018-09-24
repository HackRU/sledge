#!/bin/sh
# This is meant to be run on a fresh debian 9 install. See Deployment page in docs
# for more details.

set -e -u

export DEBIAN_FRONTEND=noninteractive

# Initial Update
apt-get -y update
apt-get -y dist-upgrade

# Add external repos
apt-get -y install apt-transport-https lsb-release
curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add -
curl -sS https://deb.nodesource.com/gpgkey/nodesource.gpg.key | apt-key add -
echo "deb https://deb.nodesource.com/node_8.x $(lsb_release -c -s) main" >/etc/apt/sources.list.d/nodesources.list
echo "deb https://dl.yarnpkg.com/debian/ stable main" >/etc/apt/sources.list.d/yarn.list

# Update repos and install additional packages
apt-get -y update
apt-get -y install nodejs yarn build-essential git sudo certbot nginx

# nginx automatically starts when it's installed, we don't want that yet
service nginx stop

# If possible, get SSL certificates
certbot certonly -n --standalone --agree-tos --email eric@threedot14.com --domains sledge.site,www.sledge.site || {
  echo "================================================"
  echo "===== WARNING: Could not get certificates! ====="
  echo "================================================"
}

# Setup iptables to block most incoming connections,
# after first deleting the current config
#  Note: We don't care about FORWARD, and we leave INPUT as accept
iptables -P INPUT ACCEPT
iptables -F INPUT
iptables -P OUTPUT ACCEPT
iptables -F OUTPUT

iptables -A INPUT -m conntrack --ctstate ESTABLISHED,RELATED -j ACCEPT
iptables -A INPUT -p tcp --match multiport --dports 22,80,443 -j ACCEPT

iptables -P INPUT DROP

# Create user for sledge
useradd -mr sledge

# Setup and build Sledge
sudo -u sledge sh - <<EOF
cd \$HOME
git clone https://github.com/HackRU/sledge.git sledge
cd sledge

yarn install
./gulp build
EOF

# Add sledge daemon command
tee /usr/local/bin/sledge-daemon <<EOF
#!/bin/sh
cd /home/sledge/sledge
sudo -u sledge ./sledge 4000
EOF

# Add and enable sledge service
tee /etc/systemd/system/sledge.service <<EOF
[Unit]
Description=A Judging System for Hackathons

[Service]
ExecStart=sledge-daemon
EOF
service sledge enable

# Add nginx config for website
tee /etc/nginx/sites-available/sledge <<EOF
server {
  listen 443 ssl;
  listen [::]:443 ssl;

  server_name www.sledge.site;

  ssl_certificate /etc/letsencrypt/live/sledge.site/fullchain.pem
  ssl_certificate_key /etc/letsencrypt/live/sledge.site/privkey.pem

  root /var/www/html;
  index index.html;

  location /socket.io {
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_http_version 1.1;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header Host $host;
    proxy_pass http://localhost:4000;
  }

  location / {
    root /home/sledge/sledge/public;
  }
}

server {
  listen 80;
  listen [::]:80;

  listen 443 ssl;
  listen [::]:443 ssl;

  ssl_certificate /etc/letsencrypt/live/sledge.site/fullchain.pem
  ssl_certificate_key /etc/letsencrypt/live/sledge.site/privkey.pem

  return 301 https://www.sledge.site$request_uri;
}
EOF
ln -s /etc/nginx/sites-available/sledge /etc/nginx/sites-enabled/sledge
nginx -t || {
  echo "=============="
  echo "== WARNING! =="
  echo "=============="
  echo
  echo "The nginx config provided is not valid. This is probably because certbot failed to get the proper certificates."
}

# Finish message
echo "============================"
echo "== Sledge Setup Complete! =="
echo "============================"
echo
echo "The setup script has finished installing Sledge. Please see documentation for what to do next."
