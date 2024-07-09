# NAND2Testris Web IDE e2e Tests

This is a brief cookbook for NAND2Tetris web ide Playwright e2e tests.

All commands should be run from the root folder, not this /e2e folder.

Before running any commands, run the server with `npm start` in a separate terminal.

## Install Playwright dependencies

```
npx playwright install
```

## Run all e2e tests

```
npm run e2e
```

## Only run tests for chip

```
npm run e2e -- chip
```

Replace chip with cpu, asm, vm, etc.

## Only run tests in Chromium

```
npm run e2e -- --project chromium
```

## Debug Tests

Use the Playwright VSCode plugin.

## View Tests

```
npm run e2e -- --ui
```

## More Info

Review the Playwright documentation and e2e folder.
