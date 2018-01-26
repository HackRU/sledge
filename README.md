# Sledge

Sledge is the judging platform used for HackRU.

## Relationship to Gavel

[Gavel][0] a judging system created for HackMIT and used in many hackathons
since including previous HackRUs. Sledge is a fork of Gavel created after
deciding that the system of pairwise comparisons used by Gavel wasn't the best
option for HackRU. Due to differences in design philosophies and some stack
changes, nearly none of the current code is shared with Gavel.

## Dependencies

The following dependencies are required for sledge:

 - Python3 w/ sqlite3 support (version 3.6.0 or greater)
 - Everything in `requirements.txt` (preferably installed via pip)

We are targeting only recent browsers. We want Sledge supported on latest
Chrome, Firefox, Edge and Safari on both desktop and mobile.

## Development

Below is the recommended way to setup your development environment on Linux,
assuming you already have the correct python and pip. Run these from the cloned
sledge directory.

    $ virtualenv -p python3.6 env
    $ source env/bin/activate
    $ pip install -r requirements.txt

To run sledge,

    $ source env/bin/activate
    $ ./sledge.py

To debug sledge, you'll need to load sample sample data and sample judges into
the database via the admin console. Open the `/admin.html` page.

### Development on WSL and iLabs

The Rutgers iLabs and WSL do not have the correct python version to run Sledge,
however it is easy to build locally.

    $ mkdir -p $HOME/local/src
    $ cd $HOME/local/src
    $ wget https://www.sqlite.org/2018/sqlite-autoconf-3220000.tar.gz
    $ tar -xf sqlite-autoconf-3220000.tar.gz
    $ cd sqlite-autoconf-3220000
    $ ./configure --prefix=$HOME/local
    $ make
    $ make install
    $ wget https://www.python.org/ftp/python/3.6.4/Python-3.6.4.tgz
    $ tar -xf Python-3.6.4.tgz
    $ cd Python-3.6.4
    $ ./configure --enable-loadable-sqlite-extensions --prefix=$HOME/local
    $ make
    $ make altinstall

Then, append `$HOME/local/bin` to your shell's PATH.

# License

See `LICENSE` file.

[0]: https://github.com/anishathalye/gavel "Gavel"
