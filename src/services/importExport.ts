import {
  ImportExportPackage,
  ImportExportPackageSchema,
  ResumeVersion,
  ResumeVersionSchema,
} from '../types/resume';
import { storageAdapter } from './storageAdapter';

// Download a JSON blob to user's device
export function downloadJsonFile(filename: string, data: object): void {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Export entire workspace (all profiles & versions)
export async function exportFullWorkspacePackage(): Promise<ImportExportPackage> {
  const pkg = await storageAdapter.exportAll();
  const dateStr = new Date().toISOString().split('T')[0];
  downloadJsonFile(`sen-resume-workspace-backup-${dateStr}.json`, pkg);
  return pkg;
}

// Export single resume version JSON
export function exportSingleResumeVersion(version: ResumeVersion): void {
  const sanitizedTitle = version.title.toLowerCase().replace(/[^a-z0-9]/g, '-');
  downloadJsonFile(`sen-resume-${sanitizedTitle}-${version.versionTag}.json`, version);
}

// Parse and validate imported JSON file content
export function parseAndValidateImport(
  rawJson: string
): {
  type: 'full-package' | 'single-version';
  data: ImportExportPackage | ResumeVersion;
} {
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawJson);
  } catch {
    throw new Error('Invalid JSON format: Unable to parse JSON file.');
  }

  // Check if it matches Full Package Schema
  const fullPkgResult = ImportExportPackageSchema.safeParse(parsed);
  if (fullPkgResult.success) {
    return {
      type: 'full-package',
      data: fullPkgResult.data,
    };
  }

  // Check if it matches Single Resume Version Schema
  const singleVersionResult = ResumeVersionSchema.safeParse(parsed);
  if (singleVersionResult.success) {
    return {
      type: 'single-version',
      data: singleVersionResult.data,
    };
  }

  // Formulate clear validation message
  const pkgErrors = fullPkgResult.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(', ');
  throw new Error(`Schema Validation Error. Neither full package nor single resume schema matched. Details: ${pkgErrors}`);
}

// Trigger browser native print for exact ATS PDF generation
export function triggerResumePrint(): void {
  window.print();
}
