# ZIP security fixtures

These tiny archives exercise the actual Electron Packager and Puppeteer extractors. Tests create a sibling sentinel inside a temporary directory, so all writes remain disposable.

- `symlink-target.zip` contains `escape` (symlink mode `0120777`) targeting `../sentinel`, reproducing CVE-2026-56876.
- `duplicate-entry.zip` contains the same symlink followed by a regular file named `escape` containing `OVERWRITE`, reproducing CVE-2026-19693.
- `valid-framework.zip` contains `F.framework/Versions/A/bin` (mode `0100755`, contents `ok`), a `Versions/Current` symlink targeting `A`, and a `bin` symlink targeting `Versions/Current/bin`.

The fixtures use stored ZIP entries with Unix modes in the upper 16 bits of each entry's external attributes. They were generated with Python's standard `zipfile` module.
