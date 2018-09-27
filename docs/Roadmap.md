# Roadmap

This document represents the goals and plans of Sledge.

## HackRU Fall 2018

All work for HackRU Fall 2018 is happening in the `fall2018` branch and will be
merged in one pull request after.

### Backup Plan

We need a physical backup plan in case Sledge doesn't work. The backup plan will
involve printed paper where judges can record their scores for each category. A
template should be made in Latex.

### Superlatives Undo Button

This currently does nothing.

### Secure Login Page

This can be done in an ad-hoc way pretty easily prior to judging. A better and
simpler solution, however, will be to simply lock down the server by adding a
password on nginx. Eventually a secure solution should be found.

## Beyond

### Code Quality and Consistency

The quality and consistency of all code in Sledge is in need of improvement. The
Typescript should essentially be gone through file by file.

### Better Tests

The unit tests should be improved and integration tests should be added. If need
be, some code should be rewritten to make unit testing easier. Fuzzy testing
should also be employed.

### Better Build Process

The build process is a mess. This should essentially be completely cleaned up.

### Make Server Less prone to crashing

The framework is implemented for this, but the code hasn't been written to
implement this. Essentially, the server will accept bad data and pass it onto
sqlite3 which will throw an error and crash the server. This can be prevented in
an ad-hoc way with try-catch statements but validating inputs beforehand would
be much more preferable. As long as only trusted clients are connected, this
isn't an issue.

### Performance Concerns

The framework for decent performance is there. Like the previous version of
Sledge, it would be farily straightforward but not necessarily quick to add
"partial updates" which would only send a diff of changed state instead of
everything.

### Licensing

Straighforward but not quick, copyright notices should be added to all the files
and it should be clear this is licensed under `AGPLv3`, not `AGPLv3+`.

### Documentation

Pretty much all the documentation deserves to be cleaned up. If this project is
ever going to be useful outside HackRU, the ease of use must be improved.

### Easy Deploy

Buttons should be added to make Sledge easy to deploy on a number of platforms,
like Heroku.

### Publish to NPM

Should probably be stable first though. We'll use semantic versioning once this
reached `v1.0.0`. Until then there's not really any reason to give Sledge a
version number.
