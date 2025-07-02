/**
 * Question 2: Stream Processing Solutions
 * 
 * Process UTF-8 stream of semicolon-delimited achievements and emit pages of 10 items
 */

import { Readable } from 'stream';

const PAGE_SIZE = 10;

/**
 * Processes a UTF-8 stream of semicolon-delimited achievements using callbacks.
 * 
 * Reads achievement data from a stream, buffers partial chunks, and emits complete
 * pages of 10 achievements each. Handles chunked data correctly by maintaining
 * an internal buffer for incomplete achievement strings.
 * 
 * @param stream - NodeJS readable stream containing UTF-8 semicolon-delimited data
 * @param onPage - Callback invoked with each complete page of achievements
 * @param onDone - Callback invoked when stream processing is complete
 * @param onError - Callback invoked if an error occurs during processing
 * 
 * @example
 * ```typescript
 * readAchievementsPage(
 *   achievementStream,
 *   (page) => console.log(`Page: ${page}`),
 *   () => console.log('Done'),
 *   (err) => console.error(err)
 * );
 * ```
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
  // Handle any remaining data achievement in buffer when the stream ends
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
 * Processes achievement stream using modern AsyncGenerator pattern.
 * 
 * Alternative implementation to the callback-based approach, using async generators
 * for cleaner iteration syntax. Yields pages of achievements as they become available.
 * 
 * @param stream - NodeJS readable stream containing UTF-8 semicolon-delimited data
 * @yields Arrays of achievement strings (up to 10 per page)
 * @throws Error if stream is invalid or processing fails
 * 
 * @example
 * ```typescript
 * for await (const page of readAchievementsPageGenerator(stream)) {
 *   console.log(`Received page with ${page.length} achievements`);
 * }
 * ```
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

/**
 * Creates a readable stream from an array of achievement strings for testing.
 * 
 * @param achievements - Array of achievement strings to stream
 * @returns Readable stream containing semicolon-delimited achievement data
 * 
 * @example
 * ```typescript
 * const stream = createAchievementsStream(['achievement1', 'achievement2']);
 * ```
 */
export function createAchievementsStream(achievements: string[]): Readable {
  const data = achievements.join(';') + ';';
  return Readable.from([data]);
}

/**
 * Promise-based wrapper around the callback-based achievement processor.
 * 
 * @param stream - NodeJS readable stream to process
 * @returns Promise resolving to array of achievement pages
 * 
 * @example
 * ```typescript
 * const pages = await processAchievementsWithCallback(stream);
 * console.log(`Got ${pages.length} pages`);
 * ```
 */
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

/**
 * Promise-based wrapper around the AsyncGenerator achievement processor.
 * 
 * @param stream - NodeJS readable stream to process
 * @returns Promise resolving to array of achievement pages
 * 
 * @example
 * ```typescript
 * const pages = await processAchievementsWithGenerator(stream);
 * console.log(`Got ${pages.length} pages using generators`);
 * ```
 */
export async function processAchievementsWithGenerator(
  stream: NodeJS.ReadableStream
): Promise<string[][]> {
  const pages: string[][] = [];
  
  for await (const page of readAchievementsPageGenerator(stream)) {
    pages.push(page);
  }
  
  return pages;
}