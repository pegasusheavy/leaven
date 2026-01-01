import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-code-block',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="code-block p-6">
      @if (title) {
        <div class="flex items-center gap-2 mb-4 pb-4 border-b border-zinc-800/50">
          <span class="w-3 h-3 rounded-full bg-red-500/80"></span>
          <span class="w-3 h-3 rounded-full bg-yellow-500/80"></span>
          <span class="w-3 h-3 rounded-full bg-green-500/80"></span>
          <span class="ml-4 text-zinc-500 text-xs">{{ title }}</span>
        </div>
      }
      <pre class="overflow-x-auto text-sm leading-relaxed"><code class="text-zinc-300" [innerHTML]="highlightedCode"></code></pre>
    </div>
  `,
})
export class CodeBlockComponent {
  @Input() code = '';
  @Input() title = '';
  @Input() language = 'typescript';

  protected get highlightedCode(): string {
    return this.highlight(this.code);
  }

  private highlight(code: string): string {
    // Tokenize first, then apply highlighting, then reassemble
    // This avoids regex conflicts entirely

    const tokens: Array<{ type: string; value: string }> = [];
    let remaining = code;

    // Tokenize the code
    while (remaining.length > 0) {
      let matched = false;

      // Try to match comment
      const commentMatch = remaining.match(/^(\/\/.*?)(?=\n|$)/);
      if (commentMatch) {
        tokens.push({ type: 'comment', value: commentMatch[0] });
        remaining = remaining.slice(commentMatch[0].length);
        matched = true;
        continue;
      }

      // Try to match string
      const stringMatch = remaining.match(/^(["'`])(?:(?!\1)[^\\]|\\.)*\1/);
      if (stringMatch) {
        tokens.push({ type: 'string', value: stringMatch[0] });
        remaining = remaining.slice(stringMatch[0].length);
        matched = true;
        continue;
      }

      // Try to match keyword
      const keywordMatch = remaining.match(/^(import|export|from|const|let|var|function|async|await|return|if|else|new|class|extends|implements|interface|type|enum|true|false|null|undefined)\b/);
      if (keywordMatch) {
        tokens.push({ type: 'keyword', value: keywordMatch[0] });
        remaining = remaining.slice(keywordMatch[0].length);
        matched = true;
        continue;
      }

      // Try to match type (PascalCase)
      const typeMatch = remaining.match(/^([A-Z][a-zA-Z][a-zA-Z0-9]*)\b/);
      if (typeMatch) {
        tokens.push({ type: 'type', value: typeMatch[0] });
        remaining = remaining.slice(typeMatch[0].length);
        matched = true;
        continue;
      }

      // Try to match function call
      const funcMatch = remaining.match(/^([a-z][a-zA-Z0-9]*)\s*(?=\()/);
      if (funcMatch) {
        tokens.push({ type: 'function', value: funcMatch[0] });
        remaining = remaining.slice(funcMatch[0].length);
        matched = true;
        continue;
      }

      // Try to match number
      const numMatch = remaining.match(/^(\d+)\b/);
      if (numMatch) {
        tokens.push({ type: 'number', value: numMatch[0] });
        remaining = remaining.slice(numMatch[0].length);
        matched = true;
        continue;
      }

      // No pattern matched - take one character as plain text
      if (!matched) {
        // Accumulate plain text
        const plainMatch = remaining.match(/^[^"'`\/a-zA-Z0-9]+/) ||
                          remaining.match(/^[a-z][a-zA-Z0-9]*(?!\s*\()/) ||
                          remaining.match(/^./);
        if (plainMatch) {
          tokens.push({ type: 'plain', value: plainMatch[0] });
          remaining = remaining.slice(plainMatch[0].length);
        }
      }
    }

    // Build HTML from tokens
    return tokens.map(token => {
      const escaped = this.escapeHtml(token.value);
      switch (token.type) {
        case 'comment':
          return `<span class="text-zinc-500 italic">${escaped}</span>`;
        case 'string':
          return `<span class="text-emerald-400">${escaped}</span>`;
        case 'keyword':
          return `<span class="text-fuchsia-400">${escaped}</span>`;
        case 'type':
          return `<span class="text-amber-300">${escaped}</span>`;
        case 'function':
          return `<span class="text-sky-400">${escaped}</span>`;
        case 'number':
          return `<span class="text-amber-400">${escaped}</span>`;
        default:
          return escaped;
      }
    }).join('');
  }

  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
}
