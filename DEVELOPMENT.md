# Development

Development happens in the `develop` branch, while the latest stable version is
in the `master` branch.

## Setup

The easiest way to get started on hacking on Gavel is to use [Vagrant][vagrant]
and run everything inside a virtual machine.

If you really want, you could also manually install stuff on your machine and
get Gavel running there.

Also, if you need help with anything, feel free to ask in the [Gitter
chat][gitter].

### Vagrant

Make sure you have [Vagrant][vagrant] installed on your machine.

To start the VM:

```bash
vagrant up
```

If you need to power off the VM at any point, run:

```bash
vagrant halt
```

To ssh into the VM:

```bash
vagrant ssh
```

**Note: the rest of the commands in this section are meant to be run _inside
the VM_, not on the host machine.**

The project directory gets synchronized to `/gavel` inside the VM. Once you're
SSHed into the box, install Gavel's dependencies. You should only need to do
this once, unless Gavel's dependencies change:

```bash
cd /gavel
virtualenv env
source ./env/bin/activate
pip install -r requirements.txt
```

Next, set up Gavel. You should only need to do this once, unless Gavel's config
options change or Gavel's database schema changes:

```bash
cp config.vagrant.yaml config.yaml # set good defaults
python initialize.py
```

Finally, you're ready to run Gavel:

```bash
DEBUG=true python runserver.py
```

Now, on your local machine, you should be able to navigate to
`http://localhost:5000/` and see Gavel running! You should be able to go to
`http://localhost:5000/admin` and login with the username "admin" with the
password "admin".

**While developing, you should keep `vagrant rsync-auto` running on the host
machine so that whenever you change any files, they're automatically synced
over to the VM.** When the app running in the VM detects changed files, it'll
automatically restart (because of the debug flag).

### Manual setup

This is not the recommended way to do things, so this section isn't super
detailed.

* Be using Python 3
* Install Postgres
* Do development inside a [virtualenv][virtualenv]
* `pip install -r requirements.txt`
* `cp config.template.yaml config.yaml`
* Edit config file for your setup
* `python initialize.py`
* `DEBUG=true python gavel.py`

## Tips

* While developing, it's helpful to set the environment variable `DEBUG=true`

* If Gavel's database schema is changed or if the database gets messed up in
  any way, you can reset everything by running (in the Vagrant VM):

    ```bash
    sudo su postgres -c "dropdb gavel && createdb gavel"
    python initialize.py
    ```

* This project uses [EditorConfig][editorconfig].
  [Download][editorconfig-download] a plugin for your editor!


# Sledge Schemes

This is sort of a tech spec for the changes that sledge would induce.

## What does sledge mean?

So Gavel is disliked for a simple reason: MLH (and most hackathon people) believe that projects stand in a pool that is the hackathon being judged. Hence, it is hard to objectively say "hack A is better than hack B". Instead, judges rank the projects in a weak ordering. The winning hack has the best of the orderings (the lowest net. ranking).

Sledge (the sledgehammer to gavel) will let judges rank hacks throughout the hackathon instead of performing counter-intuitive comparisions.

Additionally, there will be clearer ways to assign and re-assign the locations, allocate judges, and note unprepared presentations. Live updating will be supported where relevant.

## How will scoring work?

Scoring, due to the changes here, will not be done in the same way. (Gavel uses a lot of stats including a dynamically updating judge trustworthiness among other things.)

Instead of Gavel's system (for now) Sledge will use a simple scheme: the project's ranks will be summed and then the lowest average rank will win. Here's an example:

| Judge 1 | Judge 2 | Judge 3 | Overall |
| --- | --- | --- | --- |
| Hack A | Hack B | Hack A | Hack A |
| Hack B | Hack A | Hack C | Hack B |
| Hack C | Hack C | Hack B | Hack C |

## What will change?

### DB

The database will change. The mean (mu) and standard deviation (sigma_sq) can safely be dropped from item as can a judge's alpha and beta scores.

### Controllers

Not much. Just may be a socket-based connection to each annotator and the admin page for live updating.

### Templates

The `vote.html` template will need to be changed. A lot. Basically re-written. Flex-box will be used... a lot.

### JS?

There'll need to be JS. The hope is for a drag-and-drop UI for the ranking. Dragula has been chosen.

### Allocation of judges.

The way this will work is quite simple: there'll be an admin button to allow judges to start judging.

[gitter]: https://gitter.im/anishathalye/gavel
[vagrant]: https://www.vagrantup.com/
[virtualenv]: https://virtualenv.pypa.io/en/stable/
[editorconfig]: http://editorconfig.org/
[editorconfig-download]: http://editorconfig.org/#download
