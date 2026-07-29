import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CodeBlockComponent } from './code-block';

/** Reads the component's memoized highlight output without paying for DOM rendering. */
function highlightOf(fixture: ComponentFixture<CodeBlockComponent>): string {
  return (fixture.componentInstance as unknown as { highlightedCode: () => string })
    .highlightedCode();
}

/**
 * Inverse of the component's escaping: drop the `<span>` wrappers it adds and
 * decode the exactly three entities `escapeHtml` produces. Applied to the
 * highlighted output this recovers the original source, so any token that was
 * dropped, duplicated, or reordered shows up as a mismatch.
 */
function detokenize(html: string): string {
  return html
    .replace(/<span class="[^"]*">/g, '')
    .replace(/<\/span>/g, '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

describe('CodeBlockComponent', () => {
  let fixture: ComponentFixture<CodeBlockComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CodeBlockComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CodeBlockComponent);
  });

  function highlight(code: string, language?: string): string {
    fixture.componentRef.setInput('code', code);
    if (language !== undefined) {
      fixture.componentRef.setInput('language', language);
    }
    return highlightOf(fixture);
  }

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  describe('round-tripping', () => {
    const samples: Array<{ name: string; language: string; code: string }> = [
      {
        name: 'typescript',
        language: 'typescript',
        code: [
          "import { createServer } from '@leaven-graphql/http';",
          '',
          '// Preheat the oven',
          '/* block comment',
          '   spanning lines */',
          'const server = createServer({ schema, port: 4000, playground: true });',
          'export type Ctx = { user: User | null; count: number };',
          'const tpl = `hello ${name}`;',
        ].join('\n'),
      },
      {
        name: 'graphql',
        language: 'graphql',
        code: [
          '# Fetch a user',
          'query GetUser($id: ID!) {',
          '  user(id: $id) {',
          '    id',
          '    name',
          '    score',
          '  }',
          '}',
          '',
          '"""Block description"""',
          'type User implements Node {',
          '  id: ID!',
          '}',
        ].join('\n'),
      },
      {
        name: 'json',
        language: 'json',
        code: '{\n  "data": { "hello": "world", "count": -12.5e3, "ok": true, "extra": null }\n}',
      },
      {
        name: 'unterminated string',
        language: 'typescript',
        code: 'const broken = "never closed\nconst next = 1;',
      },
      {
        name: 'empty',
        language: 'typescript',
        code: '',
      },
    ];

    for (const sample of samples) {
      it(`concatenated tokens reproduce the ${sample.name} input`, () => {
        expect(detokenize(highlight(sample.code, sample.language))).toBe(sample.code);
      });
    }
  });

  describe('typescript tokens', () => {
    it('wraps a line comment in the comment span', () => {
      expect(highlight('// preheat the oven', 'typescript')).toBe(
        '<span class="text-zinc-500 italic">// preheat the oven</span>'
      );
    });

    it('wraps a block comment in the comment span', () => {
      expect(highlight('/* rise */', 'typescript')).toBe(
        '<span class="text-zinc-500 italic">/* rise */</span>'
      );
    });

    it('wraps a string literal in the string span', () => {
      expect(highlight("'@leaven-graphql/http'", 'typescript')).toBe(
        '<span class="text-emerald-400">\'@leaven-graphql/http\'</span>'
      );
    });

    it('wraps a keyword in the keyword span', () => {
      expect(highlight('const', 'typescript')).toBe(
        '<span class="text-fuchsia-400">const</span>'
      );
    });
  });

  describe('graphql tokens', () => {
    it('treats a # line as a comment rather than plain text', () => {
      expect(highlight('# a comment', 'graphql')).toBe(
        '<span class="text-zinc-500 italic"># a comment</span>'
      );
    });

    it('does not treat # as a comment in typescript', () => {
      expect(highlight('# a comment', 'typescript')).not.toContain('text-zinc-500 italic');
    });

    it('colours GraphQL operation keywords', () => {
      expect(highlight('subscription', 'graphql')).toBe(
        '<span class="text-fuchsia-400">subscription</span>'
      );
    });

    it('does not colour TypeScript-only keywords', () => {
      expect(highlight('import', 'graphql')).toBe('import');
    });

    it('handles block strings as a single string token', () => {
      expect(highlight('"""doc # not a comment"""', 'graphql')).toBe(
        '<span class="text-emerald-400">"""doc # not a comment"""</span>'
      );
    });
  });

  describe('json tokens', () => {
    it('does not apply TypeScript keyword colouring to bare words', () => {
      const html = highlight('{ interface: type }', 'json');
      expect(html).not.toContain('text-fuchsia-400');
      expect(html).not.toContain('text-amber-300');
    });

    it('colours the three JSON literals as keywords', () => {
      expect(highlight('true', 'json')).toBe('<span class="text-fuchsia-400">true</span>');
      expect(highlight('null', 'json')).toBe('<span class="text-fuchsia-400">null</span>');
    });

    it('colours a negative exponent number as one number token', () => {
      expect(highlight('-12.5e3', 'json')).toBe('<span class="text-amber-400">-12.5e3</span>');
    });

    it('does not colour capitalised words inside strings as types', () => {
      expect(highlight('"User"', 'json')).toBe('<span class="text-emerald-400">"User"</span>');
    });
  });

  describe('escaping', () => {
    it('escapes angle brackets and ampersands', () => {
      const html = highlight('a < b && c > d', 'typescript');
      expect(html).toContain('&lt;');
      expect(html).toContain('&gt;');
      expect(html).toContain('&amp;&amp;');
    });

    it('escapes markup inside a string literal so it cannot break out', () => {
      const html = highlight('const x = "<script>alert(1)</script>";', 'typescript');
      expect(html).not.toContain('<script>');
      expect(html).toContain('&lt;script&gt;');
    });

    it('escapes an ampersand before it can form an entity', () => {
      expect(highlight('&lt;', 'typescript')).toContain('&amp;lt;');
    });
  });

  describe('unknown languages', () => {
    it('falls back to the TypeScript tokenizer', () => {
      expect(highlight('const', 'rust')).toBe('<span class="text-fuchsia-400">const</span>');
    });
  });

  describe('performance', () => {
    it('tokenizes a 100 kB input in linear time', () => {
      const unit =
        "import { createServer } from '@leaven-graphql/http';\n" +
        '// a comment about the server\n' +
        'const server = createServer({ schema, port: 4000 });\n';
      const code = unit.repeat(Math.ceil(100_000 / unit.length));
      expect(code.length).toBeGreaterThanOrEqual(100_000);

      fixture.componentRef.setInput('language', 'typescript');
      fixture.componentRef.setInput('code', code);

      const started = performance.now();
      const html = highlightOf(fixture);
      const elapsed = performance.now() - started;

      expect(html.length).toBeGreaterThan(code.length);
      // Linear tokenization runs in single-digit milliseconds; the generous
      // bound only has to fail on a quadratic regression.
      expect(elapsed).toBeLessThan(1000);
    });
  });

  describe('rendering', () => {
    it('renders the highlighted code into the <code> element', async () => {
      fixture.componentRef.setInput('code', "const greeting = 'hello';");
      fixture.componentRef.setInput('title', 'example.ts');
      await fixture.whenStable();

      const element = fixture.nativeElement as HTMLElement;
      const code = element.querySelector('code');
      expect(code).not.toBeNull();
      expect(code?.textContent).toBe("const greeting = 'hello';");
      expect(code?.querySelector('span.text-fuchsia-400')?.textContent).toBe('const');
      expect(element.textContent).toContain('example.ts');
    });

    it('omits the title bar when no title is provided', async () => {
      fixture.componentRef.setInput('code', 'const x = 1;');
      await fixture.whenStable();

      const element = fixture.nativeElement as HTMLElement;
      expect(element.querySelector('.border-b')).toBeNull();
    });
  });
});
