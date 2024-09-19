const fs = require('fs');
const concurrently = require('concurrently');

const info = fs.readFileSync('package.json', 'utf8')
const workspaces = JSON.parse(info)['workspaces'];
var index = workspaces.indexOf("web");
if (index == -1) {
    throw new Error("Couldn't find web subproject in package.json");
}
workspaces.splice(index, 1);
const commands = workspaces.map(workspace => `npm run build -w ${workspace} -- -w`);
const { result } = concurrently(
    commands,
    {
        prefix: 'name',
        killOthers: ['failure', 'success'],
        restartTries: 3,
    },
);

function success(results) {
    console.log('All subprojects built successfully');
}

function failure(error) {
    console.error('Error building subprojects:', error);
}
result.then(success, failure);

