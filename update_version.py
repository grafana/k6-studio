import os
import json


version = os.environ['PACKAGE_VERSION']


with open('package.json', 'r') as f:
    data = json.loads(f.read())


with open('package.json', 'w') as f:
    data['version'] += f'-{version}'
    f.write(json.dumps(data, indent=2))

print(f'Updated package.json version to {version}')
