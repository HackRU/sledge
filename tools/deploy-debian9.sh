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
echo "deb https://deb.nodesource.com/node_10.x $(lsb_release -c -s) main" >/etc/apt/sources.list.d/nodesources.list
echo "deb https://dl.yarnpkg.com/debian/ stable main" >/etc/apt/sources.list.d/yarn.list

# Update repos and install additional packages
apt-get -y update
apt-get -y install curl nodejs yarn build-essential git sudo certbot nginx xxd sqlite3 iptables-persistent

# nginx automatically starts when it's installed, we don't want that yet
service nginx stop

# If possible, get SSL certificates
certbot certonly -n --standalone --agree-tos --email eric@threedot14.com --domains sledge.site,www.sledge.site || {
  echo "================================================"
  echo "===== WARNING: Could not get certificates! ====="
  echo "================================================"
  echo "The server will continue to be created with a self-signed certificate"
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
./gulp build
EOF

# Add sledge daemon command
tee /usr/local/bin/sledge-daemon <<EOF
#!/bin/sh
cd /home/sledge/sledge
sudo -u sledge ./sledge 4000
EOF
chmod 755 /usr/local/bin/sledge-daemon

# Add and enable sledge service
tee /lib/systemd/system/sledge.service <<EOF
[Unit]
Description=A Judging System for Hackathons

[Service]
ExecStart=/usr/local/bin/sledge-daemon

[Install]
Alias=sledge.service
WantedBy=multi-user.target
EOF
systemctl enable sledge.service
systemctl start sledge.service
sleep 3 # Wait for Sledge to fully start

# Add an initial admin token
ADMIN_TOKEN="$(head -c5 </dev/random | xxd -p)"
echo $ADMIN_TOKEN >admin-token.txt
sqlite3 /home/sledge/sledge/data/sledge.db "INSERT INTO Token(secret, privilege) VALUES(\"$ADMIN_TOKEN\", 0);"

# Sledge ssl certificate
mkdir -p /etc/nginx/ssl
ln -s /etc/letsencrypt/live/sledge.site/privkey.pem /etc/nginx/ssl/sledge.key
ln -s /etc/letsencrypt/live/sledge.site/fullchain.pem /etc/nginx/ssl/sledge.cert
tee /etc/nginx/snippets/ssl-sledge <<EOF
ssl_certificate /etc/letsencrypt/live/sledge.site/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/sledge.site/privkey.pem;
EOF

# Self-signed certificate
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/nginx/ssl/nginx.key -out /etc/nginx/ssl/nginx.cert \
  -subj "/CN=netbuzz.xyz"
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

# Add nginx config for website
tee /etc/nginx/sites-available/sledge <<EOF
server {
  listen 443 ssl;
  listen [::]:443 ssl;

  server_name www.sledge.site;

  include $SSL_SNIPPET;

  root /var/www/html;
  index index.html;

  location /socket.io {
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

  listen 443 ssl;
  listen [::]:443 ssl;

  include $SSL_SNIPPET;

  return 301 https://www.sledge.site\$request_uri;
}
EOF
ln -s /etc/nginx/sites-available/sledge /etc/nginx/sites-enabled/sledge

# Start nginx
nginx -t
systemctl start nginx

# Finish message
echo "============================"
echo "== Sledge Setup Complete! =="
echo "============================"
echo "The setup script has finished installing Sledge. Please see documentation for what to do next."
echo "Your admin token (also stored in admin-token.txt): $ADMIN_TOKEN"
