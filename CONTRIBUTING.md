# Computron 5k Contributions

- [Deployed Online](https://nand2tetris.github.io/web-ide)
- [Source](https://github.com/nand2tetris/web-ide)
- [Issues](https://github.com/nand2tetris/web-ide/issues)

## Dependencies and Environment

The Nand2Tetris Web IDE is developed in the TypeScript programming language and run on the NodeJS platform. Running the IDE and tests locally requires having `node`, `npm`, and `npx`. We recommend installing all three, as well as keeping them updated, by using the [`nvm` tool](https://github.com/nvm-sh/nvm).

```
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
```

The source code is version controlled using `git`, which should be installed using the recommended way depending on your operating system. Issues, pull requests, and other project management is conducted on [GitHub](https://github.com/nand2tetris/web-ide). When developing to contribute a feature, we recommend creating a fork, cloning from your fork, creating a new branch with `git switch -c`, pushing that branch to your fork, and creating a pull request from that branch to main. See documentation on GitHub and the internet for more details.

After cloning the repository, to install all dependencies, `cd` to the downloaded folder and run `npm install`. To update the compiled TypeScript libraries after making any changes in `simulator`, `projects`, or `components`, run `npm run build`. Alternatively, to only build one of those three, run `npm run build -w <name>`. To run all tests, run `npm test`; for tests in just one part of the project, `npm test -w <name>`. After building the libraries, you can run the web IDE with `npm run web`. This will begin the development server on https://localhost:8080.

## Issues & Pull Requests

- Send pull requests to the `main` branch.
- Please use the `bug` and `enhancement` tags when creating general issues.
- Issues tagged `good first issue` are expected to be small, focused changes to contained parts of the codebase.
- Many parts of Hack are not yet implemented. If the feature is part of the core hack book, add the issue to the `Book Parity` milestone and either the `HDL`, `CPU`, or `VM` project as appropriate.
