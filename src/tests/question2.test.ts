/**
 * Unit tests for Question 2: Stream Processing Solutions
 */

import { Readable } from 'stream';
import {
  readAchievementsPage,
  readAchievementsPageGenerator,
  createAchievementsStream,
  processAchievementsWithCallback,
  processAchievementsWithGenerator,
} from '../question2';

describe('Question 2: Stream Processing', () => {
  describe('readAchievementsPage (Callback-based)', () => {
    it('should process achievements and emit pages of 10', (done) => {
      const achievements = Array.from({ length: 25 }, (_, i) => `achievement${i + 1}`);
      const stream = createAchievementsStream(achievements);
      const pages: string[][] = [];

      readAchievementsPage(
        stream,
        (page: string[]) => pages.push([...page]),
        () => {
          try {
            expect(pages).toHaveLength(3);
            expect(pages[0]).toHaveLength(10);
            expect(pages[1]).toHaveLength(10);
            expect(pages[2]).toHaveLength(5);
            expect(pages[0]).toEqual(achievements.slice(0, 10));
            expect(pages[1]).toEqual(achievements.slice(10, 20));
            expect(pages[2]).toEqual(achievements.slice(20, 25));
            done();
          } catch (error) {
            done(error);
          }
        },
        done
      );
    });

    it('should handle exactly 10 achievements', (done) => {
      const achievements = Array.from({ length: 10 }, (_, i) => `achievement${i + 1}`);
      const stream = createAchievementsStream(achievements);
      const pages: string[][] = [];

      readAchievementsPage(
        stream,
        (page: string[]) => pages.push([...page]),
        () => {
          try {
            expect(pages).toHaveLength(1);
            expect(pages[0]).toHaveLength(10);
            expect(pages[0]).toEqual(achievements);
            done();
          } catch (error) {
            done(error);
          }
        },
        done
      );
    });

    it('should handle empty stream', (done) => {
      const stream = Readable.from(['']);
      const pages: string[][] = [];

      readAchievementsPage(
        stream,
        (page: string[]) => pages.push([...page]),
        () => {
          try {
            expect(pages).toHaveLength(0);
            done();
          } catch (error) {
            done(error);
          }
        },
        done
      );
    });

    it('should handle stream with empty achievements', (done) => {
      const stream = Readable.from([';;achievement1;;achievement2;']);
      const pages: string[][] = [];

      readAchievementsPage(
        stream,
        (page: string[]) => pages.push([...page]),
        () => {
          try {
            expect(pages).toHaveLength(1);
            expect(pages[0]).toEqual(['achievement1', 'achievement2']);
            done();
          } catch (error) {
            done(error);
          }
        },
        done
      );
    });

    it('should handle achievements with whitespace', (done) => {
      const stream = Readable.from([' achievement1 ; achievement2 ;']);
      const pages: string[][] = [];

      readAchievementsPage(
        stream,
        (page: string[]) => pages.push([...page]),
        () => {
          try {
            expect(pages).toHaveLength(1);
            expect(pages[0]).toEqual(['achievement1', 'achievement2']);
            done();
          } catch (error) {
            done(error);
          }
        },
        done
      );
    });

    it('should handle stream errors', (done) => {
      const stream = new Readable({
        read() {
          this.emit('error', new Error('Stream error'));
        }
      });

      readAchievementsPage(
        stream,
        () => {},
        () => done(new Error('Should not call onDone')),
        (error: Error) => {
          try {
            expect(error.message).toBe('Stream error');
            done();
          } catch (e) {
            done(e);
          }
        }
      );
    });

    it('should validate parameters', (done) => {
      readAchievementsPage(
        null as unknown as NodeJS.ReadableStream,
        () => {},
        () => {},
        (error: Error) => {
          try {
            expect(error.message).toBe('Invalid parameters provided');
            done();
          } catch (e) {
            done(e);
          }
        }
      );
    });

    it('should handle chunked data properly', (done) => {
      const stream = new Readable({
        read() {}
      });
      const pages: string[][] = [];

      readAchievementsPage(
        stream,
        (page: string[]) => pages.push([...page]),
        () => {
          try {
            expect(pages).toHaveLength(1);
            expect(pages[0]).toEqual(['achievement1', 'achievement2']);
            done();
          } catch (error) {
            done(error);
          }
        },
        done
      );

      // Simulate chunked data
      stream.push('achieve');
      stream.push('ment1;achie');
      stream.push('vement2;');
      stream.push(null);
    });
  });

  describe('readAchievementsPageGenerator (AsyncGenerator)', () => {
    it('should process achievements and yield pages of 10', async () => {
      const achievements = Array.from({ length: 25 }, (_, i) => `achievement${i + 1}`);
      const stream = createAchievementsStream(achievements);
      const pages: string[][] = [];

      for await (const page of readAchievementsPageGenerator(stream)) {
        pages.push([...page]);
      }

      expect(pages).toHaveLength(3);
      expect(pages[0]).toHaveLength(10);
      expect(pages[1]).toHaveLength(10);
      expect(pages[2]).toHaveLength(5);
      expect(pages[0]).toEqual(achievements.slice(0, 10));
      expect(pages[1]).toEqual(achievements.slice(10, 20));
      expect(pages[2]).toEqual(achievements.slice(20, 25));
    });

    it('should handle empty stream', async () => {
      const stream = Readable.from(['']);
      const pages: string[][] = [];

      for await (const page of readAchievementsPageGenerator(stream)) {
        pages.push([...page]);
      }

      expect(pages).toHaveLength(0);
    });

    it('should handle stream errors', async () => {
      const stream = new Readable({
        read() {
          this.emit('error', new Error('Stream error'));
        }
      });

      await expect(async () => {
        for await (const page of readAchievementsPageGenerator(stream)) {
          // Should not reach here - consume the page to avoid unused variable warning
          expect(page).toBeDefined();
        }
      }).rejects.toThrow('Stream error');
    });

    it('should validate input', async () => {
      await expect(async () => {
        for await (const page of readAchievementsPageGenerator(null as unknown as NodeJS.ReadableStream)) {
          // Should not reach here - consume the page to avoid unused variable warning
          expect(page).toBeDefined();
        }
      }).rejects.toThrow('Stream is required');
    });
  });

  describe('Helper Functions', () => {
    it('should create achievement stream correctly', () => {
      const achievements = ['achievement1', 'achievement2', 'achievement3'];
      const stream = createAchievementsStream(achievements);
      
      expect(stream).toBeInstanceOf(Readable);
    });

    it('should process achievements with callback helper', async () => {
      const achievements = Array.from({ length: 15 }, (_, i) => `achievement${i + 1}`);
      const stream = createAchievementsStream(achievements);
      
      const pages = await processAchievementsWithCallback(stream);
      
      expect(pages).toHaveLength(2);
      expect(pages[0]).toHaveLength(10);
      expect(pages[1]).toHaveLength(5);
    });

    it('should process achievements with generator helper', async () => {
      const achievements = Array.from({ length: 15 }, (_, i) => `achievement${i + 1}`);
      const stream = createAchievementsStream(achievements);
      
      const pages = await processAchievementsWithGenerator(stream);
      
      expect(pages).toHaveLength(2);
      expect(pages[0]).toHaveLength(10);
      expect(pages[1]).toHaveLength(5);
    });

    it('should produce identical results for both approaches', async () => {
      const achievements = Array.from({ length: 23 }, (_, i) => `achievement${i + 1}`);
      const stream1 = createAchievementsStream(achievements);
      const stream2 = createAchievementsStream(achievements);
      
      const callbackPages = await processAchievementsWithCallback(stream1);
      const generatorPages = await processAchievementsWithGenerator(stream2);
      
      expect(callbackPages).toEqual(generatorPages);
    });
  });
});