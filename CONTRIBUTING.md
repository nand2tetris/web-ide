# NAND2tetris Contributions

- [Deployed Online](https://nand2tetris.github.io/web-ide)
- [Source](https://github.com/nand2tetris/web-ide)
- [Issues](https://github.com/nand2tetris/web-ide/issues)

## Dependencies and Environment

The Nand2Tetris Web IDE is developed in the TypeScript programming language and run on the NodeJS platform. Running the IDE and tests locally requires Node 22 or newer and npm 10 or newer. We recommend installing and updating both with the [`nvm` tool](https://github.com/nvm-sh/nvm#installing-and-updating).

The source code is version controlled using `git`, which should be installed using the recommended way depending on your operating system. Issues, pull requests, and other project management is conducted on [GitHub](https://github.com/nand2tetris/web-ide). When developing to contribute a feature, we recommend creating a fork, cloning from your fork, creating a new branch with `git switch -c`, pushing that branch to your fork, and creating a pull request from that branch to main. See documentation on GitHub and the internet for more details.

After cloning the repository, `cd` to the downloaded folder and run `npm install` to install all dependencies. Run `npm run build` to compile every package. After changing `projects`, `runner`, `simulator`, or `components`, rebuild that package with `npm run build -w <name>`, or keep `npm run watch` running to rebuild them on change. Run all tests with `npm test`, or the tests for one package with `npm test -w <name>`. After building the libraries, start the web IDE with `npm run start`. The development server listens on <http://localhost:5173/web-ide/>.

Before opening a pull request, confirm that `npm run check` and `npm test` both pass. [DEVELOPMENT.md](./DEVELOPMENT.md) describes every command, the package layout, and the end to end tests. [MANUAL_TESTING.md](./MANUAL_TESTING.md) lists checks that some changes require. Coding agents follow [AGENTS.md](./AGENTS.md). Translators should start with [Internationalization](./DEVELOPMENT.md#internationalization).

## Issues & Pull Requests

- Send pull requests to the `main` branch.
- Please use the `bug` and `enhancement` tags when creating general issues.
- Issues tagged `good first issue` are expected to be small, focused changes to contained parts of the codebase.
- Many parts of Hack are not yet implemented. If the feature is part of the core hack book, add the issue to the `Book Parity` milestone and either the `HDL`, `CPU`, or `VM` project as appropriate.
