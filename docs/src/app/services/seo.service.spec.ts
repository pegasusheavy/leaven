import { TestBed } from '@angular/core/testing';
import { Meta, Title } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { SeoService } from './seo.service';

describe('SeoService', () => {
  let service: SeoService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([])],
    });
    service = TestBed.inject(SeoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('updatePageSEO', () => {
    it('sets the document title and core meta tags', () => {
      service.updatePageSEO({
        title: 'Installation',
        description: 'Install Leaven.',
        keywords: ['leaven', 'bun'],
      });

      const title = TestBed.inject(Title);
      const meta = TestBed.inject(Meta);

      expect(title.getTitle()).toBe('Installation | Leaven Documentation');
      expect(meta.getTag('name="description"')?.content).toBe('Install Leaven.');
      expect(meta.getTag('name="keywords"')?.content).toBe('leaven, bun');
      expect(meta.getTag('property="og:title"')?.content).toBe(
        'Installation | Leaven Documentation'
      );
      expect(meta.getTag('property="og:description"')?.content).toBe('Install Leaven.');
      expect(meta.getTag('property="og:type"')?.content).toBe('website');
      expect(meta.getTag('name="twitter:description"')?.content).toBe('Install Leaven.');
    });
  });

  describe('generateTechArticleSchema', () => {
    it('builds a TechArticle with absolute URLs', () => {
      const schema = service.generateTechArticleSchema({
        title: 'Installation',
        description: 'How to install Leaven.',
        url: '/installation',
      }) as Record<string, unknown>;

      expect(schema['@type']).toBe('TechArticle');
      expect(schema['headline']).toBe('Installation');
      expect(schema['description']).toBe('How to install Leaven.');
      expect(schema['url']).toBe('https://leaven.dev/installation');
      expect((schema['mainEntityOfPage'] as Record<string, unknown>)['@id']).toBe(
        'https://leaven.dev/installation'
      );
      expect(schema['author']).toEqual({
        '@type': 'Person',
        name: 'Joseph Quinn',
        url: 'https://github.com/quinnjr',
      });
      expect(schema['publisher']).toEqual({
        '@type': 'Person',
        name: 'Joseph Quinn',
        url: 'https://github.com/quinnjr',
      });
    });

    it('applies provided publish and modified dates', () => {
      const schema = service.generateTechArticleSchema({
        title: 'T',
        description: 'D',
        url: '/t',
        datePublished: '2026-02-01',
        dateModified: '2026-03-01',
      }) as Record<string, unknown>;

      expect(schema['datePublished']).toBe('2026-02-01');
      expect(schema['dateModified']).toBe('2026-03-01');
    });
  });

  describe('generateHowToSchema', () => {
    it('numbers steps and embeds code as a HowToDirection', () => {
      const schema = service.generateHowToSchema({
        name: 'Quick Start',
        description: 'Get started with Leaven.',
        steps: [
          { name: 'Install', text: 'Install dependencies', code: 'bun add @leaven-graphql/core' },
          { name: 'Run', text: 'Start the server' },
        ],
      }) as Record<string, unknown>;

      expect(schema['@type']).toBe('HowTo');
      const steps = schema['step'] as Array<Record<string, unknown>>;
      expect(steps).toHaveLength(2);
      expect(steps[0]['position']).toBe(1);
      expect((steps[0]['itemListElement'] as Record<string, unknown>)['text']).toBe(
        'bun add @leaven-graphql/core'
      );
      expect(steps[1]['position']).toBe(2);
      expect(steps[1]['itemListElement']).toBeUndefined();
    });
  });

  describe('generateBreadcrumbSchema', () => {
    it('builds a positioned BreadcrumbList with absolute item URLs', () => {
      const schema = service.generateBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Installation', url: '/installation' },
      ]) as Record<string, unknown>;

      expect(schema['@type']).toBe('BreadcrumbList');
      const items = schema['itemListElement'] as Array<Record<string, unknown>>;
      expect(items).toHaveLength(2);
      expect(items[0]).toEqual({
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://leaven.dev/',
      });
      expect(items[1]).toEqual({
        '@type': 'ListItem',
        position: 2,
        name: 'Installation',
        item: 'https://leaven.dev/installation',
      });
    });
  });

  describe('generateFAQSchema', () => {
    it('maps question and answer pairs into an FAQPage', () => {
      const schema = service.generateFAQSchema([
        { question: 'What is Leaven?', answer: 'A GraphQL library for Bun.' },
      ]) as Record<string, unknown>;

      expect(schema['@type']).toBe('FAQPage');
      const entities = schema['mainEntity'] as Array<Record<string, unknown>>;
      expect(entities).toHaveLength(1);
      expect(entities[0]['name']).toBe('What is Leaven?');
      expect((entities[0]['acceptedAnswer'] as Record<string, unknown>)['text']).toBe(
        'A GraphQL library for Bun.'
      );
    });
  });

  describe('generateCodeSampleSchema', () => {
    it('builds SoftwareSourceCode pointing at the real repository', () => {
      const schema = service.generateCodeSampleSchema({
        name: 'Hello resolver',
        programmingLanguage: 'TypeScript',
        codeSnippet: 'const hello = () => "world";',
      }) as Record<string, unknown>;

      expect(schema['@type']).toBe('SoftwareSourceCode');
      expect(schema['text']).toBe('const hello = () => "world";');
      expect((schema['programmingLanguage'] as Record<string, unknown>)['name']).toBe('TypeScript');
      expect(schema['codeRepository']).toBe('https://github.com/quinnjr/leaven');
    });
  });
});
