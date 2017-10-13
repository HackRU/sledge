# Sledge

Sledge is the judging platform used for HackRU.

## Installation on Debian

These installation instructions are for installing Sledge on a fresh-installed
Debian 9 server. Lasted tested 10/13/2017 from Debian 9.2.0 on netinstall ISO.

### Install Necessary packages

These packages are necessary for later installation steps to work properly.

    # apt-get install nginx libsqlite3-dev libssl-dev libz-dev gcc make

These packages are not required, but this guide will assume you have them.
Installation will likely be more complicated without these.

    # apt-get install sudo vim tmux git sqlite3 libreadline-dev python-pip

This guide assumes base packages are installed.

### Build Python 3.6

The easiest way to install Python 3.6+ on Debian is to build it. Note the
`--enable-optimizations` flag is optional and causes the build to take
significantly longer.

    # cd /usr/local/src
    # wget https://www.python.org/ftp/python/3.6.3/Python-3.6.3.tgz
    # tar -xf Python-3.6.3.tgz
    # cd Python-3.6.3
    # ./configure --enable-loadable-sqlite-extensions --enable-optimizations
    # make altinstall

### Create Sledge user account

    # adduser sledge

Follow the prompts.

### Clone Sledge

Run these commands from the newly-created account. An archive could be used as
an alternative to git.

    $ cd ~
    $ git clone https://github.com/HackRU/sledge.git
    $ cd sledge

### Create virtualenv Environment

We assume you have set added the `sledge` user to `/etc/sudoers` and are
installing dependencies with pip.

    $ sudo pip install virtualenv
    $ virtualenv -p python3.6 env
    $ source env/bin/activate
    (env) $ pip install -r requirements.txt

### Setup nginx

    $ cd ~/pip
    $ sudo cp nginx.conf /etc/nginx/nginx.conf

Edit nginx with required server details. Test the config and restart nginx.

    $ sudo vim /etc/nginx/nginx.conf
    $ sudo nginx -t
    $ sudo service nginx restart

The nginx service will now be serving the static files, although websocket
requests will fail.

### Create an empty database

    $ cd ~/sledge/sledge
    $ source ../env/bin/activate
    (env) $ python make_db.py
    (env) $ mv sledge.db ../

### Start Sledge

It is recommended you run these in a `tmux` or `screen` environment so the
session is persistent.

    $ cd ~/sledge
    $ source ../env/bin/activate
    (env) $ sslmode=require python sledge/main.py
    === Running on http://0.0.0.0:8080 ===
    (Press CTRL+C to quit)

## Configuring Sledge

In order for Sledge to be useful it must be configured. This can be done partly
the `/html/admin.html` page, must some functionality requires the database to
be edited manually, such as with the `sqlite3` command.

# License

See `LICENSE` file.
