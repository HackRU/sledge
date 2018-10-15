# Deployment (HackRU Fall 2018)

This document contains for how Sledge is expected to be deployed for HackRU Fall
2018. This should be detailed enough to follow if I (Eric) am not there, but
that's unlikely.

## Services

The plan is to deploy on a [Vultr][vultr] $20/mo tier VPS (the lowest tier
offering 2 vCPUs) in their "New York (NJ)" datacenter. Since the server will
only run for about 50 hours, not the full month, charges should be around
$1.50. We will reuse the domain `sledge.site` (registered via Namecheap) from
last HackRU.

If we insist on AWS, use at least a `t3.medium` instance, with at least 20GB of
SSD-backed storage. Please run Sledge on its own instance.

[vultr]: https://www.vultr.com/

## DNS

Through Namecheap, entries directing `sledge.site` and `www.sledge.site` need to
be created pointed to the deployed VPS. **This must be done at least 48 hours in
advance of judges for the DNS changes to propegate correctly.** Since we can't
reserve the IP in advance (as it would cost more), this means the VPS must be
running for those 48 hours. The rest of this setup doesn't need to be done that
far in advance.

## Software

Sledge should be installed on Debian 9 x64. Run the `deploy-debian.sh` script as
root from a fresh Debian 9 installation *after* the DNS propagates. If you run
the script too early, the nginx config will fail and Sledge won't be able to
start.  In this case you can rerun the cerbot command from the script and
restart the server. This should be done with nginx stopped.

After the script runs, restart the server.

## Setup

The script from the previous step should have created a `admin-token.txt` file
in the directory it was created. Go to `setup.html` and, under Authentication,
enter this token in the "secret" field. Then click "Set", "Auto: Off" (so it
becomes "Auto: On") and refresh the page. Check the Javascript console for
errors. After each action you take, be sure to check the Javascript console.

Under Manually Add Data add the following 4 categories:

 * Creativity
 * Functionality
 * Technical Difficulty
 * Design

Judges must also be added manually.

Then, follow the instructions to import from Devpost.

Click "Auto Assign Tables" and alter table placements as necessary. Note there
is nothing to preventing multiple projects from having the same table, although
this is unwise so try not to do this.

Judges must be assigned after tables are assigned. Assignments should be clear
before using "Auto Assign 3 Judges Per Hacks". Once judging starts, do not
automatically reassign judges.

## Instructions for Judges

Judges log in from `login.html`. They simply need to select their name. Then,
they should go to `judge.html` to start

## Instructions for Hackers

The only page that should concern hackers is `tables.html` which will show them
a full list of tables. If the server starts performing slowly, it might be wise
to copy this page to a spreadsheet, then disable the live version.

## What to do if...

### I need to add a Hack after judging starts

*Do not* auto-reassign judges after judging starts.

*Do not* use the "Import from Devpost" function more than once.

*Do* Add the Hack manually, then assign judges manually using the matrix. The
priority (number in the matrix) represents the order the judges will go though
hacks. When assigning manually, just choose a number higher than the judge's
current priorities (ex. 1000), and increase if there's more hacks.
