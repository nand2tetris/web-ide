const jack = `Jack <: Base {
    Root := Class

    whitespace = (lineComment | comment | space)

    class = "class" whitespace+
    Class = class jackIdentifier OpenBrace ClassVarDec* SubroutineDec* CloseBrace

    type = ("int" | "char" | "boolean" | jackIdentifier) whitespace+

    classVarType = ("static" | "field") whitespace+
    ClassVarDec = ClassVarDecBody ! Semi
    ClassVarDecBody = classVarType type jackIdentifier TrailingIdentifier*
    TrailingIdentifier = Comma jackIdentifier

    void = "void" whitespace+
    returnType = (type | void) 
    subroutineType = ("constructor" | "function" | "method") whitespace+
    SubroutineDec = SubroutineHead ! &OpenBrace SubroutineBody
    SubroutineHead = subroutineType returnType jackIdentifier OpenParen ParameterList CloseParen


    Parameter = type jackIdentifier
    Parameters = Parameter TrailingParameter*
    TrailingParameter = Comma Parameter
    ParameterList = Parameters?

    SubroutineBody = OpenBrace VarDec* Statement* ! CloseBrace

    var = "var" whitespace+
    VarDec = VarDecBody ! Semi
    VarDecBody = var type jackIdentifier TrailingIdentifier*

    Statement = LetStatement | IfStatement | WhileStatement | DoStatement | ReturnStatement

    arrayAccessStart = jackIdentifier openSquare
    ArrayAccess = arrayAccessStart Expression CloseSquare

    let = "let" whitespace+
    LetTarget = ArrayAccess | jackIdentifier
    LetStatement = LetBody ! Semi
    LetBody = let LetTarget Equal Expression

    IfStatement = IfHead ! OpenBrace Statement* ! CloseBrace ElseBlock?
    IfHead = "if" OpenParen Expression CloseParen
    ElseBlock = "else" OpenBrace Statement* ! CloseBrace

    WhileStatement = WhileHead ! OpenBrace Statement* ! CloseBrace
    WhileHead = "while" OpenParen Expression CloseParen

    do = "do" whitespace+
    DoStatement = DoBody ! Semi
    DoBody = do SubroutineCall

    return = "return"
    returnWithSpace = "return" whitespace+
    ReturnStatement = ReturnBody ! Semi
    ReturnBody = ReturnValue | EmptyReturn
    EmptyReturn = return
    ReturnValue = returnWithSpace Expression

    op = "+" | "-" | "*" | "/" | "&" | "|" | "<" | ">" | "="
    ExpressionPart = op Term
    Expression = Term ExpressionPart*

    integerConstant = digit+
    stringConstant = doubleQuote (~doubleQuote ~newline any)* doubleQuote
    keywordConstant = "true" | "false" | "null" | "this"

    GroupedExpression = OpenParen Expression CloseParen

    unaryOp = "-" | "~"
    UnaryExpression = unaryOp Term

    Term = integerConstant | stringConstant | keywordConstant | SubroutineCall  | ArrayAccess | jackIdentifier | GroupedExpression | UnaryExpression

    compoundIdentifier = jackIdentifier dot jackIdentifier
    SubroutineName = compoundIdentifier | jackIdentifier
    SubroutineCall = SubroutineName OpenParen ExpressionList CloseParen

    ExpressionList = Expressions?
    Expressions = Expression TrailingExpression*
    TrailingExpression = Comma Expression

    jackIdentifier = letter (alnum | underscore)*
}`;

export default jack;
