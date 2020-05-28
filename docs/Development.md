# Development

Sledge requires a Linux-like environment (such as Linux or WSL), since we use
[make][make] for the build system. It can probably run fine on Windows/OSX maybe
given some work, but I haven't bothered setting that up.

[make]: https://pubs.opengroup.org/onlinepubs/009695399/utilities/make.html

## Testing

[Jest][jest] is used for testing. Running `make test` will rebuild Sledge then
run tests with full coverage. You can run jest directly if you don't want to
rebuild or want to run tests with different options.

[jest]: https://jestjs.io/

```
# Run without building or coverage
$ ./node_modules/.bin/jest
```

## Typescript

As much as I like vim I find the sun shines brighter working on Typescript
if you use an editor that natively integrates with it (and has a vim pluign).
I've jumped between [VS Code][vscode] and [Webstorm][webstorm] and both work
fine.

[vscode]: https://code.visualstudio.com/
[webstorm]: https://www.jetbrains.com/webstorm/
