/**
 * Migration Cleanup Utility
 * Removes unused and redundant migration files from the workspace
 */

import * as fs from 'fs';
import * as path from 'path';
import { logger } from './server/logger';
import { FileUtils } from './server/utils';

interface CleanupResult {
  deletedFiles: string[];
  keptFiles: string[];
  errors: string[];
  totalSizeSaved: number;
}

class MigrationCleanup {
  private readonly rootPath: string;
  private readonly result: CleanupResult;

  constructor(rootPath: string) {
    this.rootPath = rootPath;
    this.result = {
      deletedFiles: [],
      keptFiles: [],
      errors: [],
      totalSizeSaved: 0
    };
  }

  async cleanup(): Promise<CleanupResult> {
    logger.info('Starting migration file cleanup...');
    
    try {
      // Find all migration-related files
      const migrationFiles = await this.findMigrationFiles();
      
      // Categorize files
      const categorized = this.categorizeFiles(migrationFiles);
      
      // Remove redundant files
      await this.removeRedundantFiles(categorized);
      
      // Clean up legacy test files
      await this.cleanupLegacyTests();
      
      logger.info(`Cleanup complete: ${this.result.deletedFiles.length} files deleted, ${this.formatBytes(this.result.totalSizeSaved)} saved`);
      
    } catch (error) {
      this.result.errors.push(`Cleanup failed: ${error.message}`);
      logger.error('Migration cleanup failed:', error);
    }
    
    return this.result;
  }

  private async findMigrationFiles(): Promise<string[]> {
    const patterns = [
      'migration*.js',
      'migration*.sql',
      '*-migration*.js',
      '*-migration*.sql',
      'test-*migration*.js',
      'run-*migration*.js',
      'create-*migration*.sql',
      'fix-*.sql',
      'migrate-*.sql'
    ];
    
    const files: string[] = [];
    
    for (const pattern of patterns) {
      const matches = await FileUtils.listFiles(this.rootPath, (filename) => {
        return this.matchesPattern(filename, pattern);
      });
      
      files.push(...matches.map(f => path.join(this.rootPath, f)));
    }
    
    return [...new Set(files)]; // Remove duplicates
  }

  private matchesPattern(filename: string, pattern: string): boolean {
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    return regex.test(filename);
  }

  private categorizeFiles(files: string[]): {
    keep: string[];
    delete: string[];
    review: string[];
  } {
    const keep: string[] = [];
    const deleteFiles: string[] = [];
    const review: string[] = [];

    // Files to definitely keep (core functionality)
    const keepPatterns = [
      'drizzle.config.ts',
      'supabase-setup.sql'
    ];

    // Files to definitely delete (temporary/obsolete)
    const deletePatterns = [
      'test-enum-migration.js',
      'test-normalization-migration.js', 
      'test-booking-athletes-migration.js',
      'run-date-time-migration.js',
      'run-normalization-migration.js',
      'create-enum-migration.sql',
      'create-normalization-migration.sql',
      'create-normalization-migration-fixed.sql',
      'migrate-date-time-columns.sql',
      'fix-enum-conversions.js',
      'fix-normalization-schema.sql',
      'fix-gender-field-and-statuses.sql',
      'fix-remaining-issues.sql',
      'booking-athletes-migration.sql',
      'complete-schema-migration.sql'
    ];

    for (const file of files) {
      const basename = path.basename(file);
      
      // Check if it should be kept
      if (keepPatterns.some(pattern => basename.includes(pattern))) {
        keep.push(file);
        continue;
      }
      
      // Check if it should be deleted
      if (deletePatterns.some(pattern => basename.includes(pattern))) {
        deleteFiles.push(file);
        continue;
      }
      
      // Files in archive/legacy-tests can be deleted
      if (file.includes('archive/legacy-tests')) {
        deleteFiles.push(file);
        continue;
      }
      
      // Temporary fix files
      if (basename.startsWith('fix-') && basename.endsWith('.sql')) {
        deleteFiles.push(file);
        continue;
      }
      
      // Otherwise, needs review
      review.push(file);
    }

    return { keep, delete: deleteFiles, review };
  }

  private async removeRedundantFiles(categorized: any): Promise<void> {
    // Delete files marked for deletion
    for (const file of categorized.delete) {
      try {
        const stats = fs.statSync(file);
        const success = await FileUtils.deleteFile(file);
        
        if (success) {
          this.result.deletedFiles.push(file);
          this.result.totalSizeSaved += stats.size;
          logger.info(`Deleted: ${path.basename(file)}`);
        } else {
          this.result.errors.push(`Failed to delete: ${file}`);
        }
      } catch (error) {
        this.result.errors.push(`Error deleting ${file}: ${error.message}`);
      }
    }

    // Log files that need review
    if (categorized.review.length > 0) {
      logger.warn('Files that need manual review:');
      categorized.review.forEach(file => {
        logger.warn(`  - ${path.basename(file)}`);
        this.result.keptFiles.push(file);
      });
    }

    // Log kept files
    categorized.keep.forEach(file => {
      this.result.keptFiles.push(file);
      logger.info(`Keeping: ${path.basename(file)}`);
    });
  }

  private async cleanupLegacyTests(): Promise<void> {
    const legacyTestDir = path.join(this.rootPath, 'archive', 'legacy-tests');
    
    if (fs.existsSync(legacyTestDir)) {
      const testFiles = await FileUtils.listFiles(legacyTestDir);
      
      for (const file of testFiles) {
        const fullPath = path.join(legacyTestDir, file);
        try {
          const stats = fs.statSync(fullPath);
          const success = await FileUtils.deleteFile(fullPath);
          
          if (success) {
            this.result.deletedFiles.push(fullPath);
            this.result.totalSizeSaved += stats.size;
            logger.info(`Deleted legacy test: ${file}`);
          }
        } catch (error) {
          this.result.errors.push(`Error deleting legacy test ${file}: ${error.message}`);
        }
      }
      
      // Try to remove the directory if empty
      try {
        const remainingFiles = fs.readdirSync(legacyTestDir);
        if (remainingFiles.length === 0) {
          fs.rmdirSync(legacyTestDir);
          logger.info('Removed empty legacy-tests directory');
        }
      } catch (error) {
        // Directory not empty or other error, that's okay
      }
    }
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Generate cleanup report
  generateReport(): string {
    const report = `
# Migration Cleanup Report

## Summary
- **Files Deleted**: ${this.result.deletedFiles.length}
- **Files Kept**: ${this.result.keptFiles.length}
- **Errors**: ${this.result.errors.length}
- **Space Saved**: ${this.formatBytes(this.result.totalSizeSaved)}

## Deleted Files
${this.result.deletedFiles.map(f => `- ${path.basename(f)}`).join('\n')}

## Kept Files
${this.result.keptFiles.map(f => `- ${path.basename(f)}`).join('\n')}

${this.result.errors.length > 0 ? `
## Errors
${this.result.errors.map(e => `- ${e}`).join('\n')}
` : ''}

## Recommendations
1. The remaining SQL files should be reviewed for current relevance
2. Consider moving essential migration scripts to a dedicated migrations/ folder
3. Use version control tags to mark migration milestones
4. Implement a migration tracking system for future changes
`;
    
    return report;
  }
}

// Export for use in other scripts
export { MigrationCleanup };

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const cleanup = new MigrationCleanup(process.cwd());
  
  cleanup.cleanup().then(result => {
    console.log('Cleanup completed:');
    console.log(`  - Deleted: ${result.deletedFiles.length} files`);
    console.log(`  - Space saved: ${cleanup['formatBytes'](result.totalSizeSaved)}`);
    console.log(`  - Errors: ${result.errors.length}`);
    
    if (result.errors.length > 0) {
      console.log('\nErrors:');
      result.errors.forEach(error => console.log(`  - ${error}`));
    }
    
    // Write report
    const report = cleanup.generateReport();
    fs.writeFileSync('MIGRATION_CLEANUP_REPORT.md', report);
    console.log('\nDetailed report written to MIGRATION_CLEANUP_REPORT.md');
  }).catch(error => {
    console.error('Cleanup failed:', error);
    process.exit(1);
  });
}
