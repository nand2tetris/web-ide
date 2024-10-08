# Regenerate Jack Lexer and Parser files

Next command gives us ability to regenerate parser and lexer after we've changed the grammar (.g4 files) for [lexer](src/languages/grammars/JackLexer.g4) or [parser](src/languages/grammars/JackParser.g4)

```
npm run gen
```
To run this command we would need to install [antlr-tools](https://github.com/antlr/antlr4-tools/blob/master/README.md). Antlr 4 tools provides commands to generate lexer and parser files. Beside that it includes `antlr4-parse` that you can use to parser an input jack file and visualize the AST tree or view the token stream. More details on [antlr-tools](https://github.com/antlr/antlr4-tools/blob/master/README.md) page.  

```
pip install antlr4-tools
```
Underneath the covers previous command will install Java runtime(JRE)(if you don't have java installed on your machine) and antlr4-{version}-complete.jar from maven.  