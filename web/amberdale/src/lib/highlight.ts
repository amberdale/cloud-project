export type TokenKind = 'plain' | 'kw' | 'str' | 'tag' | 'attr' | 'fn' | 'num' | 'com' | 'punct';
export interface Token {
  kind: TokenKind;
  text: string;
}

export interface CodeLine {
  tokens: Token[];
  /** Leading whitespace appears at once; only the rest is "typed". */
  indent: number;
  length: number;
  /** Typed characters needed before this line starts (newlines count as one). */
  offset: number;
}

export interface CodeDoc {
  lines: CodeLine[];
  total: number;
}

const KEYWORDS =
  'import|from|export|default|function|return|const|let|type|interface|if|else|new|as|true|false|null|for|of|in|typeof|extends';

const PATTERN = new RegExp(
  [
    '(\\/\\/.*$)', // 1 comment
    '("(?:[^"\\\\]|\\\\.)*"|\'(?:[^\'\\\\]|\\\\.)*\'|`(?:[^`\\\\]|\\\\.)*`)', // 2 string
    '(<\\/?)([A-Za-z][\\w.]*)', // 3, 4 jsx tag
    `\\b(${KEYWORDS})\\b`, // 5 keyword
    '\\b(\\d[\\d_]*(?:\\.\\d+)?)\\b', // 6 number
    '([A-Za-z_$][\\w$]*)(?==(?!=))', // 7 attribute / assignment target
    '([A-Za-z_$][\\w$]*)(?=\\()', // 8 call
    '([{}()[\\];,.=<>/+*?:&|!%-]+)', // 9 punctuation
  ].join('|'),
  'g',
);

export function tokenizeLine(line: string): Token[] {
  const tokens: Token[] = [];
  let last = 0;
  PATTERN.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = PATTERN.exec(line))) {
    if (m.index > last) tokens.push({ kind: 'plain', text: line.slice(last, m.index) });
    if (m[1]) tokens.push({ kind: 'com', text: m[1] });
    else if (m[2]) tokens.push({ kind: 'str', text: m[2] });
    else if (m[3]) {
      tokens.push({ kind: 'punct', text: m[3] });
      tokens.push({ kind: 'tag', text: m[4] });
    } else if (m[5]) tokens.push({ kind: 'kw', text: m[5] });
    else if (m[6]) tokens.push({ kind: 'num', text: m[6] });
    else if (m[7]) tokens.push({ kind: 'attr', text: m[7] });
    else if (m[8]) tokens.push({ kind: 'fn', text: m[8] });
    else tokens.push({ kind: 'punct', text: m[9] });
    last = PATTERN.lastIndex;
  }
  if (last < line.length) tokens.push({ kind: 'plain', text: line.slice(last) });
  return tokens;
}

export function prepareCode(source: string): CodeDoc {
  let offset = 0;
  const lines = source.replace(/\s+$/, '').split('\n').map((text) => {
    const indent = text.length - text.trimStart().length;
    const line: CodeLine = { tokens: tokenizeLine(text), indent, length: text.length, offset };
    offset += text.length - indent + 1;
    return line;
  });
  return { lines, total: offset };
}

/** Index of the line holding the caret after `typed` characters. */
export function caretLine(doc: CodeDoc, typed: number) {
  let i = 0;
  while (i + 1 < doc.lines.length && doc.lines[i + 1].offset <= typed) i++;
  return i;
}

export function sliceTokens(tokens: Token[], count: number): Token[] {
  const out: Token[] = [];
  let left = count;
  for (const token of tokens) {
    if (left <= 0) break;
    if (token.text.length <= left) out.push(token);
    else out.push({ kind: token.kind, text: token.text.slice(0, left) });
    left -= token.text.length;
  }
  return out;
}
