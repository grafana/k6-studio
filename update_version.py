import json
import os
import re
import subprocess

version = os.environ['PACKAGE_VERSION']

# package.json on a branch can lag behind the latest published release (e.g. a
# long-lived branch cut before a release-please version bump merged to main).
# Bumping relative to that stale value can land on a version that's already
# released, and a prerelease suffix like "-abc" sorts *below* the plain release
# in semver, not above it. So we bump relative to the latest published tag
# instead, which always reflects what's actually been released.
tags = subprocess.run(
    ['git', 'ls-remote', '--tags', 'origin'],
    capture_output=True, text=True, check=True,
).stdout

released_versions = [
    tuple(int(part) for part in match.groups())
    for match in (re.search(r'refs/tags/v(\d+)\.(\d+)\.(\d+)$', line) for line in tags.splitlines())
    if match
]
major, minor, patch = max(released_versions)

# Increment the minor version so that this is considered a later version than the
# latest release. This stops the auto updater from re-installing the latest release
# since the patched version is considered a newer version.
updated_version = f'{major}.{minor + 1}.0-{version}'

with open('package.json', 'r') as f:
    data = json.loads(f.read())

data['version'] = updated_version

with open('package.json', 'w') as f:
    f.write(json.dumps(data, indent=2))

print(f'Updated package.json version to {updated_version}')
