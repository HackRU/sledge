# Backup Plan

As a backup, judges will be given a clipboard, pencil and physical judging
sheets to mark their scores on. The scores will then be manually entered into a
spreadhseet, and the average score calculated for each judge.

## Assigning Tables

Let `j_0,j_1,...,j_(J-1)` be the set of judges and `h_0,h_1,...,h_(H-1)` be the
set of hacks. Each judge `j_i` will start at `h_(⌊i(H/J)⌋)` and judge a total of
`⌈3(H/J)⌉` hacks, going to `h_0` after they judge `h_(J-1)`.

For instance if there are 30 hacks and 6 judges, judge `j_5` would be assigned
`h_25-h_29` and `h_0-h_9`. This ensures at least three judges per hack, and as
long as `h_i` is near `h_(i+1)` they will go in a reasonable order.

If a hack submits late, any three judges who haven't left yet can be assigned to
them.

## Judging Sheet

The judging sheet, with instructions, can be found in latex format in the
`tools/judgingsheet` directory. This can be converted to pdf with `pdflatex
judgingsheet.tex` from that directory.

A pdf version of the judging sheet has been uploaded to
https://s3.amazonaws.com/sledge-site/judgingsheet.pdf.

At least three judging sheets should be printed per judge to ensure they have
enough, and to leave room for error. These should only be printed single-sided
to allow referencing.

## Scoring Overall Rating

Create a matrix in Excel with each row representing a judge and each column
representing a hack, and each cell representing the score, or empty if the judge
didn't score the hack. Create an additional "judge" whose score is the average
of the other judge's scores (see Excel's `AVERAGE` function). This is the
overall score for the hack.

## Scoring Superlatives

Although Sledge will ask judges to rank company prizes like superlatives, this
backup method only handles superlatives.

Create a matrix in Excel like the overall rating, except put 2 for first place
and 1 for second place. Instead of averaging, sum.

## Time considerations

If multiple people enter scores at the same time with Google Sheets the scoring
process shouldn't take too long.
