import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosResponse } from 'axios';
import * as cheerio from 'cheerio';

interface KeywordExtractorOptions {
  language: string;
  remove_digits: boolean;
  return_changed_case: boolean;
  remove_duplicates: boolean;
}

interface KeywordExtractorLib {
  extract(text: string, options: KeywordExtractorOptions): string[];
}

import * as keywordExtractorRaw from 'keyword-extractor';

const keywordExtractor = keywordExtractorRaw as unknown as KeywordExtractorLib;

@Injectable()
export class AutoTaggingService {
  private readonly logger = new Logger(AutoTaggingService.name);

  async generateTags(url: string): Promise<{ title: string; tags: string[] }> {
    const pageData = await this.scrapeMetadata(url);
    const tags = this.extractKeywords(pageData.title, pageData.description);

    return {
      title: pageData.title,
      tags: tags,
    };
  }

  private async scrapeMetadata(
    url: string,
  ): Promise<{ title: string; description: string }> {
    try {
      const response: AxiosResponse<string> = await axios.get(url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        },
        timeout: 5000,
      });

      const data: string = response.data;
      const $ = cheerio.load(data);

      const title =
        $('head > title').text() ||
        $('meta[property="og:title"]').attr('content') ||
        '';
      const description =
        $('meta[name="description"]').attr('content') ||
        $('meta[property="og:description"]').attr('content') ||
        '';

      return { title: title.trim(), description: description.trim() };
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.warn(`Failed to scrape ${url}: ${error.message}`);
      } else {
        this.logger.warn(`Failed to scrape ${url}: ${String(error)}`);
      }
      return { title: '', description: '' };
    }
  }

  private extractKeywords(title: string, description: string): string[] {
    const combinedText = `${title} ${description}`;

    if (!combinedText.trim()) return ['uncategorized'];

    try {
      const extractionResult = keywordExtractor.extract(combinedText, {
        language: 'english',
        remove_digits: true,
        return_changed_case: true,
        remove_duplicates: true,
      });

      const filteredTags = extractionResult
        .filter((word) => word.length > 3)
        .slice(0, 5);

      return filteredTags.length > 0 ? filteredTags : ['general'];
    } catch (error: any) {
      this.logger.error('Keyword extraction failed', error);
      return ['manual-review'];
    }
  }
}
