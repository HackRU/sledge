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

Sledge should be installed on Debian 9 x64. Run the `deploy-debian.sh` as root
from a fresh Debian 9 installation *after* the DNS propagates. If you run the
script too early, the nginx config will fail and Sledge won't be able to start.
In this case you can rerun the cerbot command from the script and restart the
server. This should be done with nginx stopped.

## Setup

**TODO**
