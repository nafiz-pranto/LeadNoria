/**
 * LeadNoria — Phase 16: Persistence, Recovery & Export
 * Export File Integrity & Filename Sanitizer
 * 
 * Non-Negotiable Invariants:
 * - Neutralizes path traversal attempts (../, ..\, /)
 * - Removes control characters, null bytes, and dangerous symbols
 * - Bounded filename lengths
 * - Deterministic file extensions
 */

import { ExportFormat } from './exportTypes.ts';

const MAX_FILENAME_LENGTH = 100;

export class ExportIntegrity {
  /**
   * Sanitizes a requested prefix or filename, stripping path traversal and invalid characters.
   */
  static sanitizeFilenameComponent(component: string): string {
    if (!component) return 'export';

    // Strip path traversal sequences and slashes
    let sanitized = component
      .replace(/\.\./g, '')
      .replace(/[/\\]/g, '_')
      .replace(/[<>:"|?*\x00-\x1F]/g, '')
      .trim();

    if (!sanitized) {
      sanitized = 'export';
    }

    if (sanitized.length > MAX_FILENAME_LENGTH) {
      sanitized = sanitized.substring(0, MAX_FILENAME_LENGTH);
    }

    return sanitized;
  }

  /**
   * Generates a safe, deterministic export filename.
   */
  static generateFilename(runId: string, format: ExportFormat, prefix = 'leadnoria_export'): string {
    const safePrefix = this.sanitizeFilenameComponent(prefix);
    const safeRunId = this.sanitizeFilenameComponent(runId);
    const dateStr = new Date().toISOString().slice(0, 10);
    const extension = format.toLowerCase();

    return `${safePrefix}_${safeRunId}_${dateStr}.${extension}`;
  }
}
