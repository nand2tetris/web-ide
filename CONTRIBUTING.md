# Computron 5k Contributions

- [Deployed Online](https://davidsouther.github.io/computron5k)
- [Source](https://github.com/davidsouther/computron5k)
- [Issues](https://github.com/davidsouther/computron5k/issues)

## Running

```
git clone
npm install
npm start
```

Will install all dependencies & begin the development server on https://localhost:8080.

Automated tests run at https://localhost:8080/tests, and by clicking the "Tests" link on the top right nav bar.

### Developing Jiffies

Computron5k uses an underlying HTML microframework, [Jefri Jiffies](https://github.com/jefri/jiffies).
To develop the two projects side by side, it is simplest to clone the two as sibling directories and install `jiffies` using a `file:` dependency.
Edit the `package.json` as such:

```
   dependencies: {
-    "@davidsouther/jiffies": "1.0.0",
+    "@davidsouther/jiffies": "file:../jiffies",
```

Follow Jiffie's contributions guides (largely the same as for this project), and include a link to the Jiffies pull request when opening pull requests for Computron5k.

## Issues & Pull Requests

- Send pull requests to the `jiffies` branch.
- Please use the `bug` and `enhancement` tags when creating general issues.
- Issues tagged `good first issue` are expected to be small, focused changes to contained parts of the codebase.
- Many parts of Hack are not yet implemented. If the feature is part of the core hack book, add the issue to the `Book Parity` milestone and either the `HDL`, `CPU`, or `VM` project as appropriate.
