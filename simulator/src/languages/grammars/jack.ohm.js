const jack = `
Jack <: Base {
    Root := Class

    whitespace = (lineComment | comment | space)

    class = "class" whitespace+
    Class = (ClassOpen ClassVarDec*) ! &SubroutinesStart SubroutineDec* ! ClassClose  -- body
          | &class ~MembersAhead ClassOpen ClassVarDec* ! UnclosedEnd  -- unclosed
    ClassOpen = (class jackIdentifier) ! OpenBrace
    // Class_unclosed applies only to a file with no subroutine keyword and no "}"
    // token, where Class_body cannot recover, so the two never compete. Its
    // guard follows the class keyword, where no strict failure can be.
    MembersAhead = (~SubroutinesStart (recoveryToken | any))* SubroutinesStart
    // Keep strict expected-token lists in the same order for both class alternatives.
    UnclosedEnd = &SubroutinesStart ClassClose
    SubroutinesStart = subroutineType | CloseBrace
    ClassClose = CloseBrace end
    recoveryStop = subroutineType
    recoveryToken = lineComment | comment | stringConstant | jackIdentifier | integerConstant

    type = ("int" | "char" | "boolean" | jackIdentifier) whitespace+

    classVarType = ("static" | "field") whitespace+
    ClassVarDec = (classVarType type jackIdentifier TrailingIdentifier*) ! Semi
    TrailingIdentifier = Comma jackIdentifier

    void = "void" whitespace+
    returnType = (type | void) 
    subroutineType = ("constructor" | "function" | "method") whitespace+
    SubroutineDec = (subroutineType returnType jackIdentifier OpenParen ParameterList CloseParen) ! &OpenBrace SubroutineBody


    Parameter = type jackIdentifier
    Parameters = Parameter TrailingParameter*
    TrailingParameter = Comma Parameter
    ParameterList = Parameters?

    SubroutineBody = OpenBrace VarDec* Statement* ! CloseBrace

    var = "var" whitespace+
    VarDec = (var type jackIdentifier TrailingIdentifier*) ! Semi

    Statement = LetStatement | IfStatement | WhileStatement | DoStatement | ReturnStatement

    arrayAccessStart = jackIdentifier openSquare
    ArrayAccess = arrayAccessStart Expression CloseSquare

    let = "let" whitespace+
    LetTarget = ArrayAccess | jackIdentifier
    LetStatement = (let LetTarget Equal Expression) ! Semi

    IfStatement = ("if" OpenParen Expression CloseParen) ! OpenBrace Statement* ! CloseBrace ElseBlock?
    ElseBlock = "else" OpenBrace Statement* ! CloseBrace

    WhileStatement = ("while" OpenParen Expression CloseParen) ! OpenBrace Statement* ! CloseBrace

    do = "do" whitespace+
    DoStatement = (do SubroutineCall) ! Semi

    return = "return"
    returnWithSpace = "return" whitespace+
    ReturnStatement = (ReturnValue | EmptyReturn) ! Semi
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
