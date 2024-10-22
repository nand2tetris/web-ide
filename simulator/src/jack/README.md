# ANTLR Jack compiler

ANTLR gives us ability to generate lexer and parser in the target programming language(typescript in this case) using grammar files for [lexer](src/languages/grammars/JackLexer.g4) and [parser](src/languages/grammars/JackParser.g4).

After parsing is done we get a tree data structure as an output. To do anything useful with this this tree we can use the next 2 design patterns:

1. Listener
2. Visitor

You can read more about this design patterns and the difference between them in this [blog post](https://tomassetti.me/listeners-and-visitors/). You can also check out [antlr mega tutorial from the same company](https://tomassetti.me/antlr-mega-tutorial/).

For jack we use next listeners:

- Error listener - listens to lexer and parser errors
- Global symbol table listener - creates global symbol table (classes and subroutines symbols)
- Validator listener - validates jack program
- VM Writer listener - generates VM code

# Regenerate Jack Lexer and Parser files

Next command gives us ability to regenerate parser and lexer after we've changed the grammar (.g4 files) for [lexer](src/languages/grammars/JackLexer.g4) or [parser](src/languages/grammars/JackParser.g4)

```
npm run gen
```
