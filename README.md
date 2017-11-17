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

# License

See `LICENSE` file.

[0]: https://github.com/anishathalye/gavel "Gavel"
