/**
 * LeadNoria — Spreadsheet Clipboard & Copy All Domain
 * Browser-facing Clipboard Writer Abstraction
 *
 * HARD INVARIANTS:
 * - Decouples text serialization from physical browser writing.
 * - Safely handles environments where navigator.clipboard is unavailable (e.g., Node.js, headless tests).
 * - Supports dependency injection of custom clipboard handlers for 100% unit testability.
 */

import type { ClipboardWriterOptions, ClipboardWriteResult } from './types.ts';

/**
 * Writes text to the system clipboard using the browser Clipboard API or supplied provider.
 */
export async function writeClipboardText(
  text: string,
  options?: ClipboardWriterOptions
): Promise<ClipboardWriteResult> {
  try {
    const provider = options?.clipboard ?? (
      typeof navigator !== 'undefined' && navigator.clipboard
        ? navigator.clipboard
        : undefined
    );

    if (!provider || typeof provider.writeText !== 'function') {
      return {
        success: false,
        error: 'System clipboard API is not available in current environment'
      };
    }

    await provider.writeText(text);
    return {
      success: true
    };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      error: errorMsg
    };
  }
}
