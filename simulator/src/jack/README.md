# ANTLR Jack compiler

ANTLR gives us ability to generate lexer and parser in the target programming language(typescript in this case) using grammar files for [lexer](src/languages/grammars/JackLexer.g4) and [parser](src/languages/grammars/JackParser.g4).

After parsing is done we get a tree data structure as an output. To do anything useful with this this tree we can use the next 2 design patterns:

1. Listener
2. Visitor

You can read more about this design patterns and the difference between them in this [blog post](https://tomassetti.me/listeners-and-visitors/). You can also check out [antlr mega tutorial from the same company](https://tomassetti.me/antlr-mega-tutorial/).

For jack we use next listeners:

- Error listener - listens to lexer and parser errors
- Binder listener - creates global symbol table (classes and subroutines symbols)
- Validator listener - validates jack program
- VM Writer listener - generates VM code

# Regenerate Jack Lexer and Parser files

Next command gives us ability to regenerate parser and lexer after we've changed the grammar (.g4 files) for [lexer](src/languages/grammars/JackLexer.g4) or [parser](src/languages/grammars/JackParser.g4)

```
npm run gen
```

To run this command we would need to install [antlr-tools](https://github.com/antlr/antlr4-tools/blob/master/README.md).

```
pip install antlr4-tools
```

Underneath the covers previous command will install Java runtime(JRE)(if you don't have java installed on your machine) and antlr4-{version}-complete.jar from maven.

Beside generating lexer and parser files this tools include `antlr4-parse` that you can use to parser an input jack file and visualize the AST tree or view the token stream in command line.

Small note - If you are using VSCode there is an extension to work with ANTLR grammar files.

# Working with typescript antlr runtime

As ANTLR main target for web is Javascript it doesn't have a typescript source code in general sense. Basically typescript runtime is a collection of javascript files and `.d.ts` files to provide typescript types. If you want to find out what's going on underneath the covers go to [antlr github page](https://github.com/antlr/antlr4/tree/dev/runtime/JavaScript) and find the javascript sources.
