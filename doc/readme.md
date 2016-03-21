# Cat

<? @include readme/badges.md ?>

> Load source files

Concatenate `stdin` and documents passed as `files`, buffer into a single markdown document, parse using [commonmark][], convert the parsed AST to newline-delimited JSON.

<? @include {=readme} install.md ?>

## Usage

Create the stream and write a [commonmark][] document:

<? @source {javascript=s/\.\/index/mkcat/gm} usage.js ?>

<? @include {=readme} example.md help.md ?>

<? @exec mkapi index.js --title=API --level=2 ?>
<? @include {=readme} license.md links.md ?>
