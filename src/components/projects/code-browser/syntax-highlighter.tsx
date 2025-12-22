// <== CLIENT COMPONENT ==>
"use client";

// <== IMPORTS ==>
import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

// <== SYNTAX HIGHLIGHTER PROPS ==>
interface SyntaxHighlighterProps {
  // <== CODE ==>
  code: string;
  // <== LANGUAGE ==>
  language?: string | null;
  // <== SHOW LINE NUMBERS ==>
  showLineNumbers?: boolean;
  // <== CLASS NAME ==>
  className?: string;
  // <== MAX HEIGHT ==>
  maxHeight?: string | number;
}

// <== TOKEN TYPE ==>
type TokenType =
  | "keyword"
  | "string"
  | "comment"
  | "number"
  | "function"
  | "variable"
  | "operator"
  | "punctuation"
  | "property"
  | "tag"
  | "attribute"
  | "plain";

// <== TOKEN ==>
interface Token {
  // <== TYPE ==>
  type: TokenType;
  // <== CONTENT ==>
  content: string;
}

// <== SYNTAX HIGHLIGHTER COMPONENT ==>
export const SyntaxHighlighter = ({
  code,
  language,
  showLineNumbers = true,
  className,
  maxHeight = "100%",
}: SyntaxHighlighterProps) => {
  // TOKENIZE CODE
  const lines = useMemo(() => {
    // TOKENIZE CODE
    return code.split("\n").map((line) => tokenize(line, language || "plain"));
  }, [code, language]);
  // RETURNING COMPONENT
  return (
    <ScrollArea className={cn("w-full", className)} style={{ maxHeight }}>
      <div className="font-mono text-sm">
        <table className="w-full border-collapse">
          <tbody>
            {lines.map((tokens, lineIndex) => (
              <tr
                key={lineIndex}
                className="hover:bg-secondary/30 transition-colors"
              >
                {/* LINE NUMBER */}
                {showLineNumbers && (
                  <td className="text-right pr-4 pl-4 py-0 select-none text-muted-foreground/50 text-xs w-12 align-top">
                    {lineIndex + 1}
                  </td>
                )}
                {/* CODE */}
                <td className="py-0 pr-4 whitespace-pre overflow-x-auto">
                  {tokens.map((token, tokenIndex) => (
                    <span
                      key={tokenIndex}
                      className={getTokenClassName(token.type)}
                    >
                      {token.content}
                    </span>
                  ))}
                  {tokens.length === 0 && <span>&nbsp;</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
};

// <== GET TOKEN CLASS NAME ==>
function getTokenClassName(type: TokenType): string {
  // CLASS NAMES
  const classNames: Record<TokenType, string> = {
    keyword: "text-purple-500 dark:text-purple-400",
    string: "text-green-600 dark:text-green-400",
    comment: "text-gray-500 dark:text-gray-500 italic",
    number: "text-orange-500 dark:text-orange-400",
    function: "text-blue-500 dark:text-blue-400",
    variable: "text-cyan-600 dark:text-cyan-400",
    operator: "text-pink-500 dark:text-pink-400",
    punctuation: "text-gray-600 dark:text-gray-400",
    property: "text-teal-500 dark:text-teal-400",
    tag: "text-red-500 dark:text-red-400",
    attribute: "text-yellow-600 dark:text-yellow-400",
    plain: "",
  };
  // RETURN CLASS NAME
  return classNames[type];
}

// <== TOKENIZE FUNCTION ==>
function tokenize(line: string, language: string): Token[] {
  // SIMPLE TOKENIZER
  const tokens: Token[] = [];
  // KEYWORDS BY LANGUAGE
  const keywords = getKeywords(language);
  // PATTERNS
  const patterns: Array<{ regex: RegExp; type: TokenType }> = [
    // COMMENTS
    { regex: /^(\/\/.*)$/, type: "comment" },
    { regex: /^(#.*)$/, type: "comment" },
    { regex: /^(\/\*.*\*\/)/, type: "comment" },
    // STRINGS
    { regex: /^("(?:[^"\\]|\\.)*")/, type: "string" },
    { regex: /^('(?:[^'\\]|\\.)*')/, type: "string" },
    { regex: /^(`(?:[^`\\]|\\.)*`)/, type: "string" },
    // NUMBERS
    { regex: /^(\d+\.?\d*(?:e[+-]?\d+)?)/, type: "number" },
    { regex: /^(0x[0-9a-fA-F]+)/, type: "number" },
    // OPERATORS
    { regex: /^([+\-*/%=!<>&|^~?:]+)/, type: "operator" },
    // PUNCTUATION
    { regex: /^([{}[\]();,])/, type: "punctuation" },
    // PROPERTY ACCESS
    { regex: /^\.([a-zA-Z_$][a-zA-Z0-9_$]*)/, type: "property" },
    // FUNCTION CALL
    { regex: /^([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/, type: "function" },
    // IDENTIFIERS
    { regex: /^([a-zA-Z_$][a-zA-Z0-9_$]*)/, type: "variable" },
    // WHITESPACE
    { regex: /^(\s+)/, type: "plain" },
    // OTHER
    { regex: /^(.)/, type: "plain" },
  ];
  // REMAINING LINE
  let remaining = line;
  // WHILE THERE ARE REMAINING CHARACTERS
  while (remaining.length > 0) {
    // MATCHED
    let matched = false;
    // FOR EACH PATTERN
    for (const { regex, type } of patterns) {
      // MATCH
      const match = remaining.match(regex);
      // IF MATCHED
      if (match) {
        // CONTENT
        let content = match[1] || match[0];
        // TOKEN TYPE
        let tokenType = type;
        // CHECK IF KEYWORD
        if (type === "variable" && keywords.includes(content)) {
          // SET TOKEN TYPE
          tokenType = "keyword";
        }
        // CHECK IF FUNCTION CALL
        if (type === "function") {
          // SET CONTENT
          content = match[1];
        }
        // PUSH TOKEN
        tokens.push({ type: tokenType, content });
        // REMOVE MATCHED CONTENT
        remaining = remaining.slice(match[0].length);
        // SET MATCHED
        matched = true;
        // BREAK LOOP
        break;
      }
    }
    // IF NOT MATCHED
    if (!matched) {
      // PUSH PLAIN TOKEN
      tokens.push({ type: "plain", content: remaining[0] });
      // REMOVE FIRST CHARACTER
      remaining = remaining.slice(1);
    }
  }
  // RETURN TOKENS
  return tokens;
}

// <== GET KEYWORDS BY LANGUAGE ==>
function getKeywords(language: string): string[] {
  // LANGUAGE KEYWORDS
  const languageKeywords: Record<string, string[]> = {
    javascript: [
      "const",
      "let",
      "var",
      "function",
      "return",
      "if",
      "else",
      "for",
      "while",
      "do",
      "switch",
      "case",
      "break",
      "continue",
      "default",
      "class",
      "extends",
      "new",
      "this",
      "super",
      "import",
      "export",
      "from",
      "as",
      "async",
      "await",
      "try",
      "catch",
      "finally",
      "throw",
      "typeof",
      "instanceof",
      "in",
      "of",
      "null",
      "undefined",
      "true",
      "false",
      "void",
      "delete",
      "yield",
      "static",
      "get",
      "set",
    ],
    typescript: [
      "const",
      "let",
      "var",
      "function",
      "return",
      "if",
      "else",
      "for",
      "while",
      "do",
      "switch",
      "case",
      "break",
      "continue",
      "default",
      "class",
      "extends",
      "new",
      "this",
      "super",
      "import",
      "export",
      "from",
      "as",
      "async",
      "await",
      "try",
      "catch",
      "finally",
      "throw",
      "typeof",
      "instanceof",
      "in",
      "of",
      "null",
      "undefined",
      "true",
      "false",
      "void",
      "delete",
      "yield",
      "static",
      "get",
      "set",
      "type",
      "interface",
      "enum",
      "implements",
      "private",
      "protected",
      "public",
      "readonly",
      "abstract",
      "declare",
      "namespace",
      "module",
      "keyof",
      "infer",
      "never",
      "unknown",
      "any",
    ],
    python: [
      "def",
      "class",
      "if",
      "elif",
      "else",
      "for",
      "while",
      "try",
      "except",
      "finally",
      "with",
      "as",
      "import",
      "from",
      "return",
      "yield",
      "lambda",
      "pass",
      "break",
      "continue",
      "raise",
      "assert",
      "del",
      "in",
      "not",
      "and",
      "or",
      "is",
      "True",
      "False",
      "None",
      "global",
      "nonlocal",
      "async",
      "await",
    ],
    go: [
      "package",
      "import",
      "func",
      "return",
      "var",
      "const",
      "type",
      "struct",
      "interface",
      "map",
      "chan",
      "if",
      "else",
      "for",
      "range",
      "switch",
      "case",
      "default",
      "break",
      "continue",
      "goto",
      "fallthrough",
      "defer",
      "go",
      "select",
      "make",
      "new",
      "append",
      "len",
      "cap",
      "nil",
      "true",
      "false",
    ],
    rust: [
      "fn",
      "let",
      "mut",
      "const",
      "static",
      "if",
      "else",
      "match",
      "for",
      "while",
      "loop",
      "break",
      "continue",
      "return",
      "struct",
      "enum",
      "trait",
      "impl",
      "type",
      "where",
      "use",
      "mod",
      "pub",
      "crate",
      "self",
      "super",
      "as",
      "in",
      "unsafe",
      "async",
      "await",
      "move",
      "ref",
      "true",
      "false",
      "Some",
      "None",
      "Ok",
      "Err",
    ],
    java: [
      "public",
      "private",
      "protected",
      "static",
      "final",
      "abstract",
      "class",
      "interface",
      "extends",
      "implements",
      "new",
      "this",
      "super",
      "if",
      "else",
      "for",
      "while",
      "do",
      "switch",
      "case",
      "break",
      "continue",
      "default",
      "return",
      "void",
      "int",
      "long",
      "float",
      "double",
      "boolean",
      "char",
      "byte",
      "short",
      "null",
      "true",
      "false",
      "try",
      "catch",
      "finally",
      "throw",
      "throws",
      "import",
      "package",
    ],
    ruby: [
      "def",
      "end",
      "class",
      "module",
      "if",
      "else",
      "elsif",
      "unless",
      "case",
      "when",
      "while",
      "until",
      "for",
      "do",
      "break",
      "next",
      "return",
      "yield",
      "begin",
      "rescue",
      "ensure",
      "raise",
      "retry",
      "self",
      "super",
      "nil",
      "true",
      "false",
      "and",
      "or",
      "not",
      "in",
      "require",
      "include",
      "extend",
      "attr_reader",
      "attr_writer",
      "attr_accessor",
    ],
    json: [],
    markdown: [],
    html: [],
    css: [],
    plain: [],
  };
  return languageKeywords[language] || languageKeywords.javascript || [];
}
