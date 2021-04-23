#!/bin/bash
cd /var/www/sledge/server
pm2 start ./server.js --watch -i max