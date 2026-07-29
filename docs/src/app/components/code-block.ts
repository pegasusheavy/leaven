import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

interface Token {
  type: 'comment' | 'string' | 'keyword' | 'type' | 'function' | 'number' | 'plain';
  value: string;
}

interface TokenPattern {
  type: Token['type'];
  pattern: RegExp;
}

/** Languages with a dedicated pattern table. Anything else falls back to TypeScript. */
export type CodeLanguage = 'typescript' | 'graphql' | 'json';

/**
 * Ordered, sticky token patterns. Sticky (`y`) regexes match at an explicit
 * offset via `lastIndex`, so the tokenizer walks the source in a single linear
 * pass instead of re-slicing the remaining string for every token.
 *
 * Every table must end with a `[\s\S]` catch-all so that concatenating the
 * token values always reproduces the input exactly.
 */
const TYPESCRIPT_PATTERNS: ReadonlyArray<TokenPattern> = [
  { type: 'comment', pattern: /\/\/.*/y },
  { type: 'comment', pattern: /\/\*[\s\S]*?\*\//y },
  { type: 'string', pattern: /(["'`])(?:(?!\1)[^\\]|\\.)*\1/y },
  {
    type: 'keyword',
    pattern:
      /(?:import|export|from|const|let|var|function|async|await|return|if|else|new|class|extends|implements|interface|type|enum|true|false|null|undefined)\b/y,
  },
  { type: 'type', pattern: /[A-Z][a-zA-Z][a-zA-Z0-9]*\b/y },
  { type: 'function', pattern: /[a-z][a-zA-Z0-9]*\s*(?=\()/y },
  { type: 'number', pattern: /\d+\b/y },
  { type: 'plain', pattern: /[^"'`\/a-zA-Z0-9]+/y },
  { type: 'plain', pattern: /[a-z][a-zA-Z0-9]*(?!\s*\()/y },
  { type: 'plain', pattern: /[\s\S]/y },
];

/**
 * GraphQL comments start with `#`, strings are double-quoted (with block
 * strings), and the keyword set is the SDL/operation vocabulary rather than
 * TypeScript's.
 */
const GRAPHQL_PATTERNS: ReadonlyArray<TokenPattern> = [
  { type: 'comment', pattern: /#.*/y },
  { type: 'string', pattern: /"""[\s\S]*?"""/y },
  { type: 'string', pattern: /"(?:[^"\\\n]|\\.)*"/y },
  {
    type: 'keyword',
    pattern:
      /(?:query|mutation|subscription|fragment|on|type|input|enum|interface|union|scalar|schema|directive|extend|implements|repeatable|true|false|null)\b/y,
  },
  { type: 'type', pattern: /[A-Z][a-zA-Z0-9_]*\b/y },
  { type: 'function', pattern: /[a-z_][a-zA-Z0-9_]*\s*(?=\()/y },
  { type: 'number', pattern: /-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/y },
  { type: 'plain', pattern: /[^"#a-zA-Z0-9_-]+/y },
  { type: 'plain', pattern: /[a-zA-Z_][a-zA-Z0-9_]*/y },
  { type: 'plain', pattern: /[\s\S]/y },
];

/**
 * JSON has no comments and no identifiers, so there is no keyword or type
 * colouring beyond the three literals the grammar actually defines.
 */
const JSON_PATTERNS: ReadonlyArray<TokenPattern> = [
  { type: 'string', pattern: /"(?:[^"\\\n]|\\.)*"/y },
  { type: 'keyword', pattern: /(?:true|false|null)\b/y },
  { type: 'number', pattern: /-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/y },
  { type: 'plain', pattern: /[^"a-zA-Z0-9_-]+/y },
  { type: 'plain', pattern: /[a-zA-Z_][a-zA-Z0-9_]*/y },
  { type: 'plain', pattern: /[\s\S]/y },
];

const PATTERNS_BY_LANGUAGE: Readonly<Record<CodeLanguage, ReadonlyArray<TokenPattern>>> = {
  typescript: TYPESCRIPT_PATTERNS,
  graphql: GRAPHQL_PATTERNS,
  json: JSON_PATTERNS,
};

const SPAN_BY_TOKEN_TYPE: Readonly<Record<Token['type'], string>> = {
  comment: 'text-zinc-500 italic',
  string: 'text-emerald-400',
  keyword: 'text-fuchsia-400',
  type: 'text-amber-300',
  function: 'text-sky-400',
  number: 'text-amber-400',
  plain: '',
};

@Component({
  selector: 'app-code-block',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="code-block p-6">
      @if (title()) {
        <div class="flex items-center gap-2 mb-4 pb-4 border-b border-zinc-800/50">
          <span class="w-3 h-3 rounded-full bg-red-500/80"></span>
          <span class="w-3 h-3 rounded-full bg-yellow-500/80"></span>
          <span class="w-3 h-3 rounded-full bg-green-500/80"></span>
          <span class="ml-4 text-zinc-500 text-xs">{{ title() }}</span>
        </div>
      }
      <pre class="overflow-x-auto text-sm leading-relaxed"><code class="text-zinc-300" [innerHTML]="highlightedCode()"></code></pre>
    </div>
  `,
})
export class CodeBlockComponent {
  readonly code = input('');
  readonly title = input('');
  readonly language = input<string>('typescript');

  /** Recomputed only when `code` or `language` changes, not on every change-detection pass. */
  protected readonly highlightedCode = computed(() =>
    this.highlight(this.code(), this.resolveLanguage(this.language()))
  );

  /** Unknown languages degrade to the TypeScript tokenizer rather than throwing. */
  private resolveLanguage(language: string): CodeLanguage {
    const normalized = language.toLowerCase();
    if (normalized === 'graphql' || normalized === 'gql') {
      return 'graphql';
    }
    if (normalized === 'json') {
      return 'json';
    }
    return 'typescript';
  }

  private highlight(code: string, language: CodeLanguage): string {
    return this.tokenize(code, language)
      .map((token) => {
        const escaped = this.escapeHtml(token.value);
        const className = SPAN_BY_TOKEN_TYPE[token.type];
        return className ? `<span class="${className}">${escaped}</span>` : escaped;
      })
      .join('');
  }

  private tokenize(code: string, language: CodeLanguage): Token[] {
    const patterns = PATTERNS_BY_LANGUAGE[language];
    const tokens: Token[] = [];
    let pos = 0;

    while (pos < code.length) {
      let matched = false;

      for (const { type, pattern } of patterns) {
        pattern.lastIndex = pos;
        const match = pattern.exec(code);
        if (match && match[0].length > 0) {
          tokens.push({ type, value: match[0] });
          pos += match[0].length;
          matched = true;
          break;
        }
      }

      // Defensive: guarantee forward progress even if no pattern matches.
      if (!matched) {
        tokens.push({ type: 'plain', value: code[pos] });
        pos += 1;
      }
    }

    return tokens;
  }

  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
}
