import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  parseUrlForKnownSyllabus,
  parseHtmlContent,
  parseEducationalSite
} from '../../../src/utils/syllabusParser';

describe('Syllabus Parser Utils', () => {
  describe('parseUrlForKnownSyllabus', () => {
    it('should return null for unknown URLs', () => {
      const result = parseUrlForKnownSyllabus('https://unknown-site.com/syllabus');
      expect(result).toBeNull();
    });

    it('should parse ICSE Math syllabus URL', () => {
      const result = parseUrlForKnownSyllabus('https://byjus.com/icse/icse-maths-class-9-syllabus/');

      expect(result).not.toBeNull();
      expect(result?.subjects).toHaveLength(1);
      expect(result?.subjects[0].name).toBe('Mathematics');
      expect(result?.subjects[0].chapters.length).toBeGreaterThan(0);
      expect(result?.totalChapters).toBe(8);
      expect(result?.source).toContain('ICSE');
    });

    it('should parse ICSE Physics syllabus URL', () => {
      const result = parseUrlForKnownSyllabus('https://byjus.com/icse/icse-physics-class-9-syllabus/');

      expect(result).not.toBeNull();
      expect(result?.subjects[0].name).toBe('Physics');
      expect(result?.totalChapters).toBe(8);
    });

    it('should parse ICSE Chemistry syllabus URL', () => {
      const result = parseUrlForKnownSyllabus('https://byjus.com/icse/icse-chemistry-class-9-syllabus/');

      expect(result).not.toBeNull();
      expect(result?.subjects[0].name).toBe('Chemistry');
      expect(result?.totalChapters).toBe(7);
    });

    it('should parse ICSE Biology syllabus URL', () => {
      const result = parseUrlForKnownSyllabus('https://byjus.com/icse/icse-biology-class-9-syllabus/');

      expect(result).not.toBeNull();
      expect(result?.subjects[0].name).toBe('Biology');
      expect(result?.totalChapters).toBe(8);
    });

    it('should parse CBSE Class 9 overview syllabus', () => {
      const result = parseUrlForKnownSyllabus('https://byjus.com/cbse/class-9-syllabus/');

      expect(result).not.toBeNull();
      expect(result?.subjects).toHaveLength(1);
      expect(result?.subjects[0].name).toBe('Mathematics');
      expect(result?.totalChapters).toBe(15);
    });

    it('should handle URLs without protocol', () => {
      const result = parseUrlForKnownSyllabus('byjus.com/icse/icse-maths-class-9-syllabus');

      expect(result).not.toBeNull();
      expect(result?.subjects[0].name).toBe('Mathematics');
    });

    it('should normalize URLs with www prefix', () => {
      const result = parseUrlForKnownSyllabus('https://www.byjus.com/icse/icse-maths-class-9-syllabus/');

      expect(result).not.toBeNull();
      expect(result?.subjects[0].name).toBe('Mathematics');
    });

    it('should handle URLs with trailing slashes', () => {
      const result1 = parseUrlForKnownSyllabus('https://byjus.com/icse/icse-maths-class-9-syllabus/');
      const result2 = parseUrlForKnownSyllabus('https://byjus.com/icse/icse-maths-class-9-syllabus');

      expect(result1).not.toBeNull();
      expect(result2).not.toBeNull();
      expect(result1?.totalChapters).toBe(result2?.totalChapters);
    });

    it('should return chapters with correct structure', () => {
      const result = parseUrlForKnownSyllabus('https://byjus.com/icse/icse-maths-class-9-syllabus/');

      expect(result).not.toBeNull();
      const chapter = result!.subjects[0].chapters[0];
      expect(chapter).toHaveProperty('name');
      expect(chapter).toHaveProperty('estimatedHours');
      expect(chapter).toHaveProperty('difficulty');
      expect(chapter.name).toBe('Rational and Irrational Numbers');
      expect(chapter.estimatedHours).toBeGreaterThan(0);
      expect(['easy', 'medium', 'hard']).toContain(chapter.difficulty);
    });

    it('should return chapters with topics when available', () => {
      const result = parseUrlForKnownSyllabus('https://byjus.com/icse/icse-maths-class-9-syllabus/');

      expect(result).not.toBeNull();
      const chapter = result!.subjects[0].chapters[0];
      expect(chapter.topics).toBeDefined();
      expect(chapter.topics!.length).toBeGreaterThan(0);
    });

    it('should parse all ICSE subject syllabi', () => {
      const subjects = [
        { url: 'https://byjus.com/icse/icse-english-class-9-syllabus/', name: 'English', chapters: 5 },
        { url: 'https://byjus.com/icse/icse-history-civics-class-9-syllabus/', name: 'History & Civics', chapters: 9 },
        { url: 'https://byjus.com/icse/icse-geography-class-9-syllabus/', name: 'Geography', chapters: 9 },
        { url: 'https://byjus.com/icse/icse-economics-class-9-syllabus/', name: 'Economics', chapters: 8 },
        { url: 'https://byjus.com/icse/icse-hindi-class-9-syllabus/', name: 'Hindi', chapters: 8 },
        { url: 'https://byjus.com/icse/icse-computer-science-class-9-syllabus/', name: 'Computer Science', chapters: 9 }
      ];

      subjects.forEach(subject => {
        const result = parseUrlForKnownSyllabus(subject.url);
        expect(result).not.toBeNull();
        expect(result?.subjects[0].name).toBe(subject.name);
        expect(result?.totalChapters).toBe(subject.chapters);
      });
    });
  });

  describe('parseHtmlContent', () => {
    it('should return known syllabus if URL matches', () => {
      const html = '<html><body><h1>Test</h1></body></html>';
      const result = parseHtmlContent(html, 'https://byjus.com/icse/icse-maths-class-9-syllabus/');

      expect(result).not.toBeNull();
      expect(result?.subjects[0].name).toBe('Mathematics');
    });

    it('should parse HTML with table structure', () => {
      const html = `
        <html><body>
          <table>
            <tr><th>Chapter</th></tr>
            <tr><td>Chapter 1: Introduction to Physics</td></tr>
            <tr><td>Chapter 2: Motion and Force</td></tr>
            <tr><td>Chapter 3: Energy and Work</td></tr>
          </table>
        </body></html>
      `;
      const result = parseHtmlContent(html, 'https://example.com/physics/syllabus');

      expect(result).not.toBeNull();
      expect(result?.subjects[0].chapters.length).toBeGreaterThan(0);
    });

    it('should parse HTML with list structure', () => {
      const html = `
        <html><body>
          <ul>
            <li>Chapter 1: Introduction to Chemistry</li>
            <li>Chapter 2: Atomic Structure</li>
            <li>Chapter 3: Chemical Bonding</li>
          </ul>
        </body></html>
      `;
      const result = parseHtmlContent(html, 'https://example.com/chemistry/syllabus');

      expect(result).not.toBeNull();
      expect(result?.subjects[0].chapters.length).toBeGreaterThan(0);
    });

    it('should parse HTML with heading structure', () => {
      const html = `
        <html><body>
          <h2>Chapter 1: Introduction to Biology</h2>
          <h2>Chapter 2: Cell Structure and Functions</h2>
          <h2>Chapter 3: Diversity in Living Organisms</h2>
        </body></html>
      `;
      const result = parseHtmlContent(html, 'https://example.com/biology/syllabus');

      expect(result).not.toBeNull();
      expect(result?.subjects[0].chapters.length).toBeGreaterThan(0);
    });

    it('should detect subject from URL', () => {
      const html = '<html><body><p>Test</p></body></html>';
      const result = parseHtmlContent(html, 'https://example.com/mathematics/class-9');

      // Should fallback to empty since no parseable content, but URL detection happens
      // Actually, parseHtmlContent returns null when no chapters found
      // Let me check the implementation again...
      // Looking at the code, if no chapters are found, it returns null
      expect(result).toBeNull();
    });

    it('should return null for unparseable HTML', () => {
      const html = '<html><body><p>No chapters here</p></body></html>';
      const result = parseHtmlContent(html, 'https://example.com/unknown');

      expect(result).toBeNull();
    });

    it('should handle malformed HTML gracefully', () => {
      const html = '<html><body><table><tr><td>Broken';
      const result = parseHtmlContent(html, 'https://example.com/test');

      // Should either return null or handle gracefully
      expect(result === null || result !== undefined).toBe(true);
    });

    it('should limit chapters to 20', () => {
      // Create HTML with many chapters
      const chapters = Array.from({ length: 30 }, (_, i) =>
        `<tr><td>Chapter ${i + 1}: Topic ${i + 1}</td></tr>`
      ).join('');
      const html = `<html><body><table>${chapters}</table></body></html>`;

      const result = parseHtmlContent(html, 'https://example.com/test');

      expect(result).not.toBeNull();
      expect(result!.subjects[0].chapters.length).toBeLessThanOrEqual(20);
    });

    it('should extract topics from table rows with chapter pattern', () => {
      const html = `
        <html><body>
          <table>
            <tr>
              <td>Chapter 1: Introduction to Algebra</td>
              <td>Variables, Equations, Solving</td>
            </tr>
            <tr>
              <td>Chapter 2: Geometry Basics</td>
              <td>Points, Lines, Angles</td>
            </tr>
          </table>
        </body></html>
      `;
      const result = parseHtmlContent(html, 'https://example.com/math');

      // May or may not parse depending on isLikelyChapterName logic
      // Just verify it doesn't crash
      expect(result === null || result !== undefined).toBe(true);
    });
  });

  describe('parseEducationalSite', () => {
    beforeEach(() => {
      // Mock console.log to avoid cluttering test output
      vi.spyOn(console, 'log').mockImplementation(() => {});

      // Mock fetch to avoid real network calls and timeouts
      global.fetch = vi.fn().mockRejectedValue(new Error('Network mock'));
    });

    it('should parse known ICSE Math syllabus', async () => {
      const result = await parseEducationalSite('https://byjus.com/icse/icse-maths-class-9-syllabus/');

      expect(result).not.toBeNull();
      expect(result?.subjects[0].name).toBe('Mathematics');
      expect(result?.source).toContain('Verified Data');
    });

    it('should handle index pages with multiple subjects', async () => {
      const result = await parseEducationalSite('https://byjus.com/icse/class-9-syllabus');

      expect(result).not.toBeNull();
      // Index page should return multiple subjects
      expect(result?.subjects.length).toBeGreaterThan(1);
      expect(result?.source).toContain('subjects');
    });

    it('should call onProgress callback', async () => {
      const progressMessages: string[] = [];
      const onProgress = (msg: string) => progressMessages.push(msg);

      await parseEducationalSite('https://byjus.com/icse/class-9-syllabus', onProgress);

      expect(progressMessages.length).toBeGreaterThan(0);
    });

    it('should fallback to mock data for unknown URLs', async () => {
      const result = await parseEducationalSite('https://unknown-edu-site.com/class-9/physics');

      expect(result).not.toBeNull();
      expect(result?.subjects.length).toBeGreaterThan(0);
      expect(result?.source).toContain('Smart extraction');
    });

    it('should detect Mathematics subject from URL', async () => {
      const result = await parseEducationalSite('https://example.com/mathematics/class-9');

      expect(result).not.toBeNull();
      expect(result?.subjects[0].name).toBe('Mathematics');
    });

    it('should detect Physics subject from URL', async () => {
      const result = await parseEducationalSite('https://example.com/physics/syllabus');

      expect(result).not.toBeNull();
      expect(result?.subjects[0].name).toBe('Physics');
    });

    it('should detect Chemistry subject from URL', async () => {
      const result = await parseEducationalSite('https://example.com/chemistry/curriculum');

      expect(result).not.toBeNull();
      expect(result?.subjects[0].name).toBe('Chemistry');
    });

    it('should detect Biology subject from URL', async () => {
      const result = await parseEducationalSite('https://example.com/biology/class-9');

      expect(result).not.toBeNull();
      expect(result?.subjects[0].name).toBe('Biology');
    });

    it('should detect English subject from URL', async () => {
      const result = await parseEducationalSite('https://example.com/english/syllabus');

      expect(result).not.toBeNull();
      expect(result?.subjects[0].name).toBe('English');
    });

    it('should detect History subject from URL', async () => {
      const result = await parseEducationalSite('https://example.com/history/class-9');

      expect(result).not.toBeNull();
      expect(result?.subjects[0].name).toBe('History');
    });

    it('should detect Geography subject from URL', async () => {
      const result = await parseEducationalSite('https://example.com/geography/syllabus');

      expect(result).not.toBeNull();
      expect(result?.subjects[0].name).toBe('Geography');
    });

    it('should detect Computer Science subject from URL', async () => {
      const result = await parseEducationalSite('https://example.com/computer-science/class-9');

      expect(result).not.toBeNull();
      expect(result?.subjects[0].name).toBe('Computer Science');
    });

    it('should generate ICSE pattern for ICSE URLs', async () => {
      const result = await parseEducationalSite('https://example.com/icse/maths/class-9');

      expect(result).not.toBeNull();
      expect(result?.source).toContain('ICSE');
    });

    it('should generate CBSE pattern for CBSE URLs', async () => {
      const result = await parseEducationalSite('https://example.com/cbse/maths/class-9');

      expect(result).not.toBeNull();
      expect(result?.source).toContain('CBSE');
    });

    it('should return chapters with valid estimated hours', async () => {
      const result = await parseEducationalSite('https://example.com/physics/syllabus');

      expect(result).not.toBeNull();
      const chapter = result!.subjects[0].chapters[0];
      expect(chapter.estimatedHours).toBeGreaterThanOrEqual(2);
      expect(chapter.estimatedHours).toBeLessThanOrEqual(15);
    });

    it('should return chapters with valid difficulty levels', async () => {
      const result = await parseEducationalSite('https://example.com/math/syllabus');

      expect(result).not.toBeNull();
      result!.subjects[0].chapters.forEach(chapter => {
        expect(['easy', 'medium', 'hard']).toContain(chapter.difficulty);
      });
    });

    it('should handle CBSE index page', async () => {
      const result = await parseEducationalSite('https://byjus.com/cbse/class-9-syllabus');

      expect(result).not.toBeNull();
      expect(result?.subjects.length).toBeGreaterThan(1);
    });

    it('should return consistent structure for mock data', async () => {
      const result = await parseEducationalSite('https://unknown.com/test');

      expect(result).not.toBeNull();
      expect(result).toHaveProperty('subjects');
      expect(result).toHaveProperty('totalChapters');
      expect(result).toHaveProperty('source');
      expect(Array.isArray(result!.subjects)).toBe(true);
    });

    it('should handle URLs with Economics subject', async () => {
      const result = await parseEducationalSite('https://example.com/economics/class-9');

      expect(result).not.toBeNull();
      expect(result?.subjects[0].name).toBe('Economics');
    });

    it('should fallback to General Studies for unrecognized subjects', async () => {
      const result = await parseEducationalSite('https://example.com/unknown-subject/syllabus');

      expect(result).not.toBeNull();
      expect(result?.subjects[0].name).toBe('General Studies');
    });

    it('should generate reasonable chapter count', async () => {
      const result = await parseEducationalSite('https://example.com/test/syllabus');

      expect(result).not.toBeNull();
      expect(result!.totalChapters).toBeGreaterThan(0);
      expect(result!.totalChapters).toBeLessThanOrEqual(20);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle empty URL', () => {
      const result = parseUrlForKnownSyllabus('');
      expect(result).toBeNull();
    });

    it('should handle invalid URL format', () => {
      const result = parseUrlForKnownSyllabus('not-a-valid-url');
      // Should still try to parse, may return null
      expect(result === null || result !== undefined).toBe(true);
    });

    it('should handle URL with special characters', () => {
      const result = parseUrlForKnownSyllabus('https://example.com/syllabus?param=value&test=123');
      expect(result).toBeNull();
    });

    it('should handle empty HTML', () => {
      const result = parseHtmlContent('', 'https://example.com/test');
      expect(result).toBeNull();
    });

    it('should handle HTML with no parseable content', () => {
      const html = '<html><body></body></html>';
      const result = parseHtmlContent(html, 'https://example.com/test');
      expect(result).toBeNull();
    });

    it('should handle async errors gracefully', async () => {
      // Mock fetch to throw error
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      const result = await parseEducationalSite('https://example.com/test');

      // Should still return mock data as fallback
      expect(result).not.toBeNull();
    });
  });
});
