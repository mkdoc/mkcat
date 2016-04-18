## Example

Read files:

```shell
mkcat README.md | mkout
```

Read `stdin`:

```shell
cat README.md | mkcat | mkout
```

However this is not recommended because file path information is lost which is important for some processing tools.

Concatenate `stdin` with files:

```shell
cat README.md | mkcat API.md DEVELOPER.md | mkout
```

