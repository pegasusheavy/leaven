import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, DOCUMENT } from '@angular/common';
import { Meta, Title } from '@angular/platform-browser';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

export interface PageSEO {
  title: string;
  description: string;
  keywords?: string[];
  canonical?: string;
  ogImage?: string;
  ogType?: 'website' | 'article';
  articlePublishedTime?: string;
  articleModifiedTime?: string;
  articleAuthor?: string;
  structuredData?: object;
}

export interface BreadcrumbItem {
  name: string;
  url: string;
}

@Injectable({
  providedIn: 'root'
})
export class SeoService {
  private readonly baseUrl = 'https://leaven.dev';
  private readonly siteName = 'Leaven Documentation';
  private readonly defaultImage = '/og-image.png';
  private readonly twitterHandle = '@PegasusHeavyInd';

  constructor(
    private meta: Meta,
    private titleService: Title,
    private router: Router,
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) private platformId: object
  ) {
    // Track route changes for canonical updates
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event) => {
      const navEnd = event as NavigationEnd;
      this.updateCanonical(navEnd.urlAfterRedirects);
    });
  }

  /**
   * Update all SEO meta tags for a page
   */
  updatePageSEO(config: PageSEO): void {
    const fullTitle = `${config.title} | ${this.siteName}`;

    // Update title
    this.titleService.setTitle(fullTitle);

    // Primary meta tags
    this.updateMetaTag('description', config.description);
    this.updateMetaTag('keywords', config.keywords?.join(', ') ?? '');

    // Open Graph
    this.updateMetaTag('og:title', fullTitle, 'property');
    this.updateMetaTag('og:description', config.description, 'property');
    this.updateMetaTag('og:type', config.ogType ?? 'website', 'property');
    this.updateMetaTag('og:image', `${this.baseUrl}${config.ogImage ?? this.defaultImage}`, 'property');
    this.updateMetaTag('og:site_name', this.siteName, 'property');

    // Twitter Card
    this.updateMetaTag('twitter:title', fullTitle, 'name');
    this.updateMetaTag('twitter:description', config.description, 'name');
    this.updateMetaTag('twitter:image', `${this.baseUrl}${config.ogImage ?? this.defaultImage}`, 'name');
    this.updateMetaTag('twitter:creator', this.twitterHandle, 'name');

    // Article-specific
    if (config.ogType === 'article') {
      if (config.articlePublishedTime) {
        this.updateMetaTag('article:published_time', config.articlePublishedTime, 'property');
      }
      if (config.articleModifiedTime) {
        this.updateMetaTag('article:modified_time', config.articleModifiedTime, 'property');
      }
      if (config.articleAuthor) {
        this.updateMetaTag('article:author', config.articleAuthor, 'property');
      }
    }

    // Canonical URL
    if (config.canonical) {
      this.updateCanonical(config.canonical);
    }

    // Structured data
    if (config.structuredData) {
      this.updateStructuredData(config.structuredData);
    }
  }

  /**
   * Update canonical URL
   */
  updateCanonical(path: string): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const canonicalUrl = `${this.baseUrl}${path}`;
    let link: HTMLLinkElement | null = this.document.querySelector('link[rel="canonical"]');

    if (!link) {
      link = this.document.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.document.head.appendChild(link);
    }

    link.setAttribute('href', canonicalUrl);
    this.updateMetaTag('og:url', canonicalUrl, 'property');
    this.updateMetaTag('twitter:url', canonicalUrl, 'name');
  }

  /**
   * Update or create a meta tag
   */
  private updateMetaTag(name: string, content: string, attributeType: 'name' | 'property' = 'name'): void {
    const selector = attributeType === 'property'
      ? `property="${name}"`
      : `name="${name}"`;

    if (content) {
      this.meta.updateTag({ [attributeType]: name, content });
    } else {
      this.meta.removeTag(selector);
    }
  }

  /**
   * Update structured data (JSON-LD)
   */
  updateStructuredData(data: object): void {
    if (!isPlatformBrowser(this.platformId)) return;

    // Remove existing dynamic structured data
    const existing = this.document.querySelector('script[data-seo="dynamic"]');
    if (existing) {
      existing.remove();
    }

    // Add new structured data
    const script = this.document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-seo', 'dynamic');
    script.textContent = JSON.stringify(data);
    this.document.head.appendChild(script);
  }

  /**
   * Generate TechArticle structured data for documentation pages
   */
  generateTechArticleSchema(config: {
    title: string;
    description: string;
    url: string;
    datePublished?: string;
    dateModified?: string;
  }): object {
    return {
      '@context': 'https://schema.org',
      '@type': 'TechArticle',
      'headline': config.title,
      'description': config.description,
      'url': `${this.baseUrl}${config.url}`,
      'datePublished': config.datePublished ?? '2026-01-01',
      'dateModified': config.dateModified ?? '2026-01-01',
      'author': {
        '@type': 'Organization',
        'name': 'Pegasus Heavy Industries LLC',
        'url': 'https://pegasusheavyindustries.com'
      },
      'publisher': {
        '@type': 'Organization',
        'name': 'Pegasus Heavy Industries LLC',
        'logo': {
          '@type': 'ImageObject',
          'url': `${this.baseUrl}/logo.png`
        }
      },
      'mainEntityOfPage': {
        '@type': 'WebPage',
        '@id': `${this.baseUrl}${config.url}`
      },
      'about': {
        '@type': 'SoftwareApplication',
        'name': 'Leaven',
        'applicationCategory': 'DeveloperApplication'
      }
    };
  }

  /**
   * Generate HowTo structured data for tutorial pages
   */
  generateHowToSchema(config: {
    name: string;
    description: string;
    steps: Array<{ name: string; text: string; code?: string }>;
    totalTime?: string;
  }): object {
    return {
      '@context': 'https://schema.org',
      '@type': 'HowTo',
      'name': config.name,
      'description': config.description,
      'totalTime': config.totalTime ?? 'PT10M',
      'tool': [
        {
          '@type': 'HowToTool',
          'name': 'Bun Runtime'
        },
        {
          '@type': 'HowToTool',
          'name': 'Text Editor or IDE'
        }
      ],
      'step': config.steps.map((step, index) => ({
        '@type': 'HowToStep',
        'position': index + 1,
        'name': step.name,
        'text': step.text,
        ...(step.code ? {
          'itemListElement': {
            '@type': 'HowToDirection',
            'text': step.code
          }
        } : {})
      }))
    };
  }

  /**
   * Generate breadcrumb structured data
   */
  generateBreadcrumbSchema(items: BreadcrumbItem[]): object {
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      'itemListElement': items.map((item, index) => ({
        '@type': 'ListItem',
        'position': index + 1,
        'name': item.name,
        'item': `${this.baseUrl}${item.url}`
      }))
    };
  }

  /**
   * Generate FAQ structured data for AEO
   */
  generateFAQSchema(faqs: Array<{ question: string; answer: string }>): object {
    return {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      'mainEntity': faqs.map(faq => ({
        '@type': 'Question',
        'name': faq.question,
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': faq.answer
        }
      }))
    };
  }

  /**
   * Generate CodeSample structured data
   */
  generateCodeSampleSchema(config: {
    name: string;
    programmingLanguage: string;
    codeSnippet: string;
    description?: string;
  }): object {
    return {
      '@context': 'https://schema.org',
      '@type': 'SoftwareSourceCode',
      'name': config.name,
      'programmingLanguage': {
        '@type': 'ComputerLanguage',
        'name': config.programmingLanguage
      },
      'text': config.codeSnippet,
      'description': config.description ?? '',
      'codeRepository': 'https://github.com/PegasusHeavyIndustries/leaven'
    };
  }
}
