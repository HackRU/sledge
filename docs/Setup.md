# Setup

This guide contains instructions for setting up a test environment after sledge
has been build. See README for build instructions.

First, start sledge to initialize the databse and open the server.

```
$ ./sledge
```

Before doing anything we should add an admin token. All sqlite3 commands can be
run while sledge is running.

```
$ sqlite3 data/sledge.db
sqlite3> INSERT INTO Token(secret, privilege) VALUES("test", 0);
```

Now navigate to the setup page (`http://localhost:8080/setup.html`). Set your
test secret and click authenticate.  Always check the javascript dev console
after every action to look for a success message or errors.

Judges and categories can be added manually. Hacks and superlatives can be
imported from devpost. See https://sledge-site.s3.amazonaws.com/testdevpost.csv
for test data.

Next, make sure you can see all hacks and judges under the appropriate sections.
Use the button to automatically assign tables.
