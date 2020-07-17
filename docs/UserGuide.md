
# User Guide

## Introduction

Sledge is a judging system designed for hackathons but general enough to be used
for other events. The goal of Sledge is to display results in real time to
organizers and to allow adjustment to be made on the fly. Additionally our goal
is to make Sledge easy and cheap to deploy, easy to teach to judges, and have
the data be analyzed with software outside of Sledge.

## How to run Sledge

### Requirements

Sledge is designed to run on GNU/Linux. See the README for more specific
requirements.

### Getting Sledge

The source for Sledge can be obtained via git from our official repository.

```
git clone https://github.com/HackRU/sledge.git
```

The latest reviewed version of the code can be found on `master`. Alternatively,
you can [download the source as a zip archive][sledge-zip].

Currently we do not have the option to download prebuilt versions of Sledge.

[sledge-zip]: https://github.com/HackRU/sledge/archive/master.zip

### Building and Running

First you must obtain and build node dependencies, then the build process can be
run using make. Once Sledge is built use the cli found in `bin` to start the
server. A full list of cli options can be found with the `--help` flag. The
following should be run from the directory you extracted or cloned Sledge into.

```
yarn install
make build
./bin/sledge --port 8080
```

Sledge will now be running on `http://localhost:8080/`. Please read the
deployment recommendations section if you are running Sledge for use at
actual hackathons.

## Concepts

Sledge is designed to meet the judging requirements for HackRU but is general
enough that it can be used in may different ways. To start it helps to
understand some of the internal terminology used.

### Terminology

**Judges** are the people chosen to have an opinion of the submissions.
They are the end users of Sledge who use the system to input numerical
and comparative scoring of the submissions.

A **submission** is anything eligible for any type of judging. For a
hackathon this will be an individual hack. Each submission has a
human-readable name and a **location**, which is a positive integer used to
understand how the exposition floor is laid out
(for science fair style judging). Sledge tries to give judges submissions
close together, and uses the location to do so. Sledge assumes a circular
topology (for instance, if there are submissions of locations 1 through 10,
it assumes 1 is next to 10). Judges are shown both the name and location of a
submission when asked to judge it.

Additionally each submission has a **track** defining the "type" of
submission that it is. We use tracks to specify different areas of focus a
hack could be: gaming, medical, etc that participants know beforehand. For
numerical ratings this determines which **categories** judges see when scoring
the submission. A category is some criteria which judges will give the
submission a number between 1 and 5. For instance a gaming hack might be
rated on the category "fun factor" while a medical hack might be rated on
"usefulness".

A **prize** is some general criteria that a submission can be best at. All
submissions or a subset of submissions can be eligible for a prize
(for instance, not
every hack would be eligible for Best Solo Hack). In determining the best
submission for a given prize we take into account both ratings and rankings
specific to that prize. This doesn't have to map one-to-one with what prizes
are given out. For instance, you might configure a Best Overall prize for
which there's actually a first, second and third place.

Sledge interacts with judges through a number of **assignments**, which is a
task that they are sent out to do involving giving an opinion on one or more
submissions. A **rating assignment** is an assignment which asks a judge to
give a 1 to 5 score on some categories for a submission as
determined by its track. A rating assignment will also give the option of not
giving a rating if the submission didn't show up. Judges can also be given
**ranking assignments** in which they compare multiple submissions on the
basis of a certain prize. A judge will not receive a ranking assignment
asking to compare submissions they have not seen. A judge is considered to
have seen a submission if they rated it. Assignments are generally given
on the fly after they complete the last one, although there are situations
when a judge will have multiple assignments queued up.

Sledge splits its execution into three **phases**: setup, collection and
tally. Judges only enter scores during the collection phase, and Sledge
assumes certain information won't change after collection starts, for
instance that submissions won't be deleted and categories won't be
added or removed. The purpose of the setup phase is to give a chance for
this information to be setup before collection starts. The tally phase prevents
scores from changing as the data is being analyzed.

### Scope

When using Sledge it's important to understand the scope of what it's trying
to accomplish. First, as a security model, Sledge assumes all users are
trusted. This means there are no permissions checks and there is no concept
of an admin or superuser versus a regular judge. If sledge needs to know
which judge you are it will simply ask, supplying a list of judges. We expect
you don't expose a Sledge instance publicly, instead putting it behind some other
security measure such as the basic HTTP authentication built into nginx (see
Deployment Recommendations). Additionally, this means there are no general
participant-facing features such as giving users a list of hack names mapped
locations.

It is also outside the scope of Sledge to give an objective list of winners.
Sledge collects scoring data and provides tools to analyze it, and give a top
list based on certain criteria, but it's up to the event organizers to make the
final decision about winners. In past HackRUs we've determined
Sledge's judging data was too close to call and used methods outside
Sledge to select the final winner.

## Getting Started

*Some of the Getting Started section is incomplete or outdated*

To help you get started this tutorial will walk you through setting up the
Fall 2019 HackRU data. Before starting get a fresh Sledge instance setup
using the instructions earlier in this document.

Data is imported using the `/populate` page you can add and edit information
related to the submissions, tracks, judges, categories and prizes we want to
setup. Information on this page is stored locally on your machine, and is
only imported when the "Populate Server" button is pressed. This also means
this information could be deleted if you clear browser data.

HackRU uses Devpost, and which can export submission data as a CSV file.
Before continuing, make sure there's no data on the
populate page by clicking "Reset" near the top. Then, go to `/devpost` and
paste our [exported submission data][sp2019data] into the form and click GO.
Then, go back to to the populate page and click Reload from LocalStorage to
see the data we've loaded.

[sp2019data]: https://s3.amazonaws.com/sledge-assets/hackru-sp2019.csv

The data is not ready to be imported yet. HackRU does not use Sledge for
scoring sponsor prizes (its up to sponsors to choose their own winners) so
these must be removed before import. Scroll down to Prizes and click Remove
on all prizes except Best Solo, Failure to Launch, Best Newbie and the 4
tracks. You'll notice these prizes are removed from the list of submissions
as well.

Our goal is to prepare for 11 prizes: a first place for each prize in the
system and second place for all tracks. To setup tracks, click "Convert to
Track" for each of the Track prizes. Next, we setup categories. Start by
adding 4 categories: Creativity, Functionality, Technical Difficulty and
Design. Each of these categories we want to display for each track so we
click Expand once on each and remove the Default Track categories. We then
add categories specific to tracks: Usefulness (education), Environment
(feasibility), Impact (health) and Making a Difference (maverick). Use Cycle
Track to choose the correct track for each.

Then, add 10-20 fictional judges of your choice. At the bottom of the page
click Populate Server and ensure the server comes back with a successful
response.

If you look back through the populate page you'll see some submissions still
use the Default Track, which got imported to the server. Depending on the
situation if you accidently import bad data you can usually delete the
`sledge.db` file, restart the server and reimport. Your data should still be
in localStorage. In this case, we'll use SQL to change all submissions on the
Default Track to the Maverick track. Sledge's frontend functionality is
limited so we assume anyone setting up Sledge has SQL access to the
`sledge.db` file.

Opening the file with the `sqlite3` command, we look up the ids of each
track and update any Default Track submissions to Maverick. Be sure to
reference the `schema.sql` file to understand how data is stored in the
database.

```
$ sqlite3 data/sledge.db
sqlite> SELECT * FROM Track;
1|Default Track
2|Maverick Track
3|Education Track
4|Health Track
5|Social Good Track
sqlite> UPDATE Submission SET trackId=2 WHERE trackId=1;
```

Then you can use the Start Judging button to enter the collection phase after
confirming the imported data looks okay.

Once you're in collection phase go to the `/login` page and select one of
your judges created earlier. Sledge will begin to send you to hacks to score.

TODO: Management during submission, one-off events like adding late
submissions and analyzing data to produce winners.

## Deployment Recommendations

*Deployment Recommendations may be outdated, see [DeployScript.md][dpmd]*

[dpmd]: DeployScript.md

We recommend running Sledge on hardware with at least two logical processors and
at least 1GB of RAM. In the past we have used the 60GB tier VC2 from Vultr,
which provides two vCPUs. Ideally Sledge should be run on its own instance.

To reduce the load on the sledge app, the server should be placed behind a
reverse proxy such as nginx and only socket requests on the `/socket.io` route
be handled by node. Static content found in the `public` directory after
building should be handled separately. Additionally a reverse proxy is necessary
for HTTPS. The `/socket.io` path should not be open to the public. See
nginx's [HTTP Basic Auth][nginx-auth] documentation for an example of how to
restrict this.

[nginx-auth]: https://docs.nginx.com/nginx/admin-guide/security-controls/configuring-http-basic-authentication/

Sledge outputs logs to stderr depending on the value of `DEBUG` (environment
variable, see the [debug library][debug-pkg]). For instance, this can be set
to `sledge` to only produce logs from sledge, or `*` to produce logs for
dependencies such as socket.io or express. Since logging output is not
automatically saved you may want to use a tool, such as creating a systemd
service, to do this.

[debug-pkg]: https://www.npmjs.com/package/debug

See the `tools` directory for scripts which can deploy Sledge to give you an
idea of what these suggestions look like in practice.
