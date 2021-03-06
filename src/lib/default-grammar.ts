export default `
S -> Program {{ return $1; }}

Program -> StatementList {{ return { type: $$, statements: $1 }; }}

StatementList -> DeclarationStatement StatementList {{ return [$1, ...$2]; }}
StatementList -> ε {{ return []; }}

DeclarationStatement -> StructDeclaration | ImplDeclaration | FunctionDefinition {{ return $1; }}

StructDeclaration -> 'struct' 'id' OptStructInheritanceList '{' StructMemberDeclarationList '}' ';' {{ return { type: $$, location: $1.location, name: $2.value, inheritanceList: $3, body: $5 }; }}

StructInheritanceList -> 'inherits' 'id' ReptStructInheritanceList {{ return [$2.value, ...$3]; }}
OptStructInheritanceList -> StructInheritanceList {{ return $1; }}
OptStructInheritanceList -> ε {{ return []; }}
ReptStructInheritanceList -> ',' 'id' ReptStructInheritanceList {{ return [$2.value, ...$3]; }}
ReptStructInheritanceList -> ε {{ return []; }}

StructMemberDeclaration -> Visibility MemberDeclaration {{ return { visibility: $1, ...$2 }; }}
StructMemberDeclarationList -> StructMemberDeclaration StructMemberDeclarationList {{ return [$1, ...$2]; }}
StructMemberDeclarationList -> ε {{ return []; }}

Visibility -> 'private' | 'public' {{ return $1.value; }}

MemberDeclaration -> FunctionDeclaration | VariableDeclaration {{ return $1; }}

FunctionDeclaration -> FunctionDeclarationInit ';' {{ return { ...$1, type: $$ }; }}

FunctionDeclarationInit -> 'func' 'id' '(' OptFunctionParameterList ')' '->' ReturnType {{ return { type: $$, location: $1.location, name: $2.value, parameters: $4, returnType: $7.value }; }}

ReturnType -> Type | 'void' {{ return $1; }}

Type -> 'id' | 'integer' | 'float' {{ return $1; }}

FunctionParameterList -> FunctionParameter ReptFunctionParameterList {{ return [$1, ...$2]; }}
OptFunctionParameterList -> FunctionParameterList {{ return $1; }}
OptFunctionParameterList -> ε {{ return []; }}
ReptFunctionParameterList -> ',' FunctionParameter ReptFunctionParameterList {{ return [$2, ...$3]; }}
ReptFunctionParameterList -> ε {{ return []; }}

FunctionParameter -> 'id' ':' Type ReptArraySize {{ return { type: $$, location: $1.location, name: $1.value, varType: $3.value, arraySizes: $4 }; }}

ArraySize -> '[' OptIntLiteral ']' {{ return $2; }}
ReptArraySize -> ArraySize ReptArraySize {{ return [$1, ...$2]; }}
ReptArraySize -> ε {{ return []; }}

OptIntLiteral -> 'int_literal' {{ return $1.value; }}
OptIntLiteral -> ε {{ return 0; }}

VariableDeclaration -> 'let' 'id' ':' Type ReptArraySize ';' {{ return { type: $$, location: $1.location, name: $2.value, varType: $4.value, arraySizes: $5 }; }}

ImplDeclaration -> 'impl' 'id' '{' FunctionDefinitionList '}' {{ return { type: $$, location: $1.location, name: $2.value, body: $4 }; }}

FunctionDefinitionList -> FunctionDefinition FunctionDefinitionList {{ return [$1, ...$2]; }}
FunctionDefinitionList -> ε {{ return []; }}

FunctionDefinition -> FunctionDeclarationInit FunctionBody {{ return { ...$1, type: $$, body: $2 }; }}

FunctionBody -> '{' FunctionStatementList '}' {{ return $2; }}

FunctionStatementList -> FunctionStatement FunctionStatementList {{ return [$1, ...$2]; }}
FunctionStatementList -> ε {{ return []; }}

FunctionStatement -> BlockStatement | VariableDeclaration | ExpressionStatement | IfStatement | WhileStatement | ReadStatement | WriteStatement | ReturnStatement {{ return $1; }}
OptFunctionStatement -> FunctionStatement {{ return $1; }}
OptFunctionStatement -> ε {{ return null; }}

BlockStatement -> '{' FunctionStatementList '}' {{ return { type: $$, statements: $2 }; }}

ExpressionStatement -> Expression ';' {{ return { type: $$, expression: $1 }; }}

IfStatement -> 'if' '(' LogicalORExpression ')' 'then' OptFunctionStatement 'else' OptFunctionStatement ';' {{ return { type: $$, location: $1.location, condition: $3, ifBody: $6, elseBody: $8 }; }}

WhileStatement -> 'while' '(' LogicalORExpression ')' OptFunctionStatement ';' {{ return { type: $$, location: $1.location, condition: $3, body: $5 }; }}

ReadStatement -> 'read' '(' CallMemberExpression ')' ';' {{ return { type: $$, location: $1.location, expression: $3 }; }}

WriteStatement -> 'write' '(' LogicalORExpression ')' ';' {{ return { type: $$, location: $1.location, expression: $3 }; }}

ReturnStatement -> 'return' '(' LogicalORExpression ')' ';' {{ return { type: $$, location: $1.location, expression: $3 }; }}

Expression -> AssignmentExpression {{ return $1; }}

AssignmentExpression -> LogicalORExpression OptAssignmentExpressionEnd {{ return $2 ? { type: $$, left: $1, right: $2 } : $1; }}

AssignmentExpressionEnd -> '=' LogicalORExpression {{ return $2; }}
OptAssignmentExpressionEnd -> AssignmentExpressionEnd {{ return $1; }}
OptAssignmentExpressionEnd -> ε {{ return null; }}

LogicalORExpression -> LogicalANDExpression ReptLogicalORExpression {{ let left = $1; while ($2.length > 0) { const next = $2.shift(); left = { type: 'BinaryExpression', operator: next.op, left, right: next }; delete next.op; } return left; }}
ReptLogicalORExpression -> 'or_op' LogicalANDExpression ReptLogicalORExpression {{ return [{ op: $1.value, ...$2 }, ...$3]; }}
ReptLogicalORExpression -> ε {{ return []; }}

LogicalANDExpression -> EqualityExpression ReptLogicalANDExpression {{ let left = $1; while ($2.length > 0) { const next = $2.shift(); left = { type: 'BinaryExpression', operator: next.op, left, right: next }; delete next.op; } return left; }}
ReptLogicalANDExpression -> 'and_op' EqualityExpression ReptLogicalANDExpression {{ return [{ op: $1.value, ...$2 }, ...$3]; }}
ReptLogicalANDExpression -> ε {{ return []; }}

EqualityExpression -> RelationalExpression ReptEqualityExpression {{ let left = $1; while ($2.length > 0) { const next = $2.shift(); left = { type: 'BinaryExpression', operator: next.op, left, right: next }; delete next.op; } return left; }}
ReptEqualityExpression -> 'eq_op' RelationalExpression ReptEqualityExpression {{ return [{ op: $1.value, ...$2 }, ...$3]}}
ReptEqualityExpression -> ε {{ return []; }}

RelationalExpression -> AdditiveExpression ReptRelationalExpression {{ let left = $1; while ($2.length > 0) { const next = $2.shift(); left = { type: 'BinaryExpression', operator: next.op, left, right: next }; delete next.op; } return left; }}
ReptRelationalExpression -> 'rel_op' AdditiveExpression ReptRelationalExpression {{ return [{ op: $1.value, ...$2 }, ...$3]}}
ReptRelationalExpression -> ε {{ return []; }}

AdditiveExpression -> MultiplicativeExpression ReptAdditiveExpression {{ let left = $1; while ($2.length > 0) { const next = $2.shift(); left = { type: 'BinaryExpression', operator: next.op, left, right: next }; delete next.op; } return left; }}
ReptAdditiveExpression -> 'add_op' MultiplicativeExpression ReptAdditiveExpression {{ return [{ op: $1.value, ...$2 }, ...$3]}}
ReptAdditiveExpression -> ε {{ return []; }}

MultiplicativeExpression -> UnaryExpression ReptMultiplicativeExpression {{ let left = $1; while ($2.length > 0) { const next = $2.shift(); left = { type: 'BinaryExpression', operator: next.op, left, right: next }; delete next.op; } return left; }}
ReptMultiplicativeExpression -> 'mul_op' UnaryExpression ReptMultiplicativeExpression {{ return [{ op: $1.value, ...$2 }, ...$3]}}
ReptMultiplicativeExpression -> ε {{ return []; }}

UnaryExpression -> LeftHandSideExpression {{ return $1; }}
UnaryExpression -> 'add_op' UnaryExpression {{ return { type: $$, operator: $1.value, expression: $2 }; }}
UnaryExpression -> 'not_op' UnaryExpression {{ return { type: $$, operator: $1.value, expression: $2 }; }}

LeftHandSideExpression -> CallMemberExpression | PrimaryExpression {{ return $1; }}

CallMemberExpression -> 'id' MemberIndexCall ReptCallMemberExpression {{ return { type: 'IdentifierExpression', ...$2, location: $1.location, identifier: $1.value, chainedExpression: $3 }; }}

ReptCallMemberExpression -> '.' 'id' MemberIndexCall ReptCallMemberExpression {{ return { type: 'IdentifierExpression', ...$3, location: $2.location, identifier: $2.value, chainedExpression: $4 }; }}
ReptCallMemberExpression -> ε {{ return null; }}

MemberIndexCall -> ReptIndex {{ return { type: 'MemberIndexExpression', indices: $1 }; }}
MemberIndexCall -> '(' OptArgumentList ')' {{ return { type: 'FunctionCallExpression', arguments: $2 }; }}

ReptIndex -> Index ReptIndex {{ return [$1, ...$2]; }}
ReptIndex -> ε {{ return []; }}
Index -> '[' AdditiveExpression ']' {{ return { type: $$, expression: $2 }; }}

ArgumentList -> LogicalORExpression ReptArgumentList {{ return [$1, ...$2]; }}
ReptArgumentList -> ',' LogicalORExpression ReptArgumentList {{ return [$2, ...$3]; }}
ReptArgumentList -> ε {{ return []; }}
OptArgumentList -> ArgumentList {{ return $1; }}
OptArgumentList -> ε {{ return []; }}

PrimaryExpression -> Literal {{ return $1; }}
PrimaryExpression -> '(' LogicalORExpression ')' {{ return $2; }}

Literal -> 'int_literal' {{ return { type: 'IntegerLiteral', location: $1.location, value: $1.value }; }}
Literal -> 'float_literal' {{ return { type: 'FloatLiteral', location: $1.location, value: $1.value }; }}

'id' -> '[a-zA-Z][a-zA-Z0-9_]*'
'int_literal' -> '(?:[1-9][0-9]*|0)'
'float_literal' -> '[+\\-]?(?:[1-9][0-9]*|0)?(?:\\.[0-9]*[1-9]|\\.0)(?:[eE][+\\-]?(?:[1-9][0-9]*|0))?'

'add_op' -> '[+-]'
'mul_op' -> '[*/]'
'or_op' -> '\\|\\|'
'and_op' -> '&&'
'eq_op' -> '(?:==|!=)'
'rel_op' -> '(?:>=|<=|>|<)'
'not_op' -> '!'
`;
