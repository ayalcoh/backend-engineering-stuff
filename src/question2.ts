/**
 * Question 2: Stream Processing Solutions
 * 
 * Process UTF-8 stream of semicolon-delimited achievements and emit pages of 10 items
 */

import { Readable } from 'stream';

const PAGE_SIZE = 10;

/**
 * Part A: Callback-based stream processor
 */
export function readAchievementsPage(
  stream: NodeJS.ReadableStream,
  onPage: (achievements: string[]) => void,
  onDone: () => void,
  onError: (error: Error) => void,
): void {
  let buffer = '';
  let currentPage: string[] = [];

  if (!stream || typeof onPage !== 'function' || typeof onDone !== 'function' || typeof onError !== 'function') {
    onError(new Error('Invalid parameters provided'));
    return;
  }

  if ('setEncoding' in stream && typeof stream.setEncoding === 'function') {
    stream.setEncoding('utf8');
  }

  stream.on('data', (chunk: string) => {
    try {
      buffer += chunk;
      
      let semicolonIndex;
      while ((semicolonIndex = buffer.indexOf(';')) !== -1) {
        const achievement = buffer.slice(0, semicolonIndex).trim();
        buffer = buffer.slice(semicolonIndex + 1);
        
        if (achievement) {
          currentPage.push(achievement);
          
          if (currentPage.length === PAGE_SIZE) {
            onPage([...currentPage]);
            currentPage = [];
          }
        }
      }
    } catch (error) {
      onError(error instanceof Error ? error : new Error('Unknown error processing stream data'));
    }
  });
  // Handle any remaing data achievement in buffer when the stream ends
  stream.on('end', () => {
    try {
      const remaining = buffer.trim();
      if (remaining) {
        currentPage.push(remaining);
      }
      
      if (currentPage.length > 0) {
        onPage([...currentPage]);
      }
      
      onDone();
    } catch (error) {
      onError(error instanceof Error ? error : new Error('Error processing final data'));
    }
  });

  stream.on('error', (error: Error) => {
    onError(error);
  });
}

/**
 * Part B: AsyncGenerator implementation
 */
export async function* readAchievementsPageGenerator(
  stream: NodeJS.ReadableStream
): AsyncGenerator<string[], void, unknown> {
  let buffer = '';
  let currentPage: string[] = [];

  if (!stream) {
    throw new Error('Stream is required');
  }

  if ('setEncoding' in stream && typeof stream.setEncoding === 'function') {
    stream.setEncoding('utf8');
  }

  try {
    for await (const chunk of stream) {
      buffer += chunk;
      
      let semicolonIndex;
      while ((semicolonIndex = buffer.indexOf(';')) !== -1) {
        const achievement = buffer.slice(0, semicolonIndex).trim();
        buffer = buffer.slice(semicolonIndex + 1);
        
        if (achievement) {
          currentPage.push(achievement);
          
          if (currentPage.length === PAGE_SIZE) {
            yield [...currentPage];
            currentPage = [];
          }
        }
      }
    }

    const remaining = buffer.trim();
    if (remaining) {
      currentPage.push(remaining);
    }
    
    if (currentPage.length > 0) {
      yield [...currentPage];
    }
  } catch (error) {
    throw error instanceof Error ? error : new Error('Error processing stream');
  }
}

// Helper functions for testing
export function createAchievementsStream(achievements: string[]): Readable {
  const data = achievements.join(';') + ';';
  return Readable.from([data]);
}

export function processAchievementsWithCallback(
  stream: NodeJS.ReadableStream
): Promise<string[][]> {
  return new Promise((resolve, reject) => {
    const pages: string[][] = [];
    
    readAchievementsPage(
      stream,
      (page) => pages.push(page),
      () => resolve(pages),
      (error) => reject(error)
    );
  });
}

export async function processAchievementsWithGenerator(
  stream: NodeJS.ReadableStream
): Promise<string[][]> {
  const pages: string[][] = [];
  
  for await (const page of readAchievementsPageGenerator(stream)) {
    pages.push(page);
  }
  
  return pages;
}