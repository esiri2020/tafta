import { revalidateTag } from 'next/cache';
import { cacheManager, CacheKeys } from './redis';

/**
 * Cache revalidation utility for Next.js
 */
export class CacheRevalidator {
  /**
   * Revalidate Next.js cache tags
   */
  async revalidateTags(tags: string[]): Promise<void> {
    try {
      for (const tag of tags) {
        await revalidateTag(tag);
        console.log(`🔄 Revalidated Next.js cache tag: ${tag}`);
      }
    } catch (error) {
      console.error('❌ Next.js cache revalidation error:', error);
    }
  }
  
  /**
   * Revalidate Redis cache by pattern
   */
  async revalidateRedisPattern(pattern: string): Promise<void> {
    try {
      await cacheManager.delPattern(pattern);
      console.log(`🗑️ Invalidated Redis cache pattern: ${pattern}`);
    } catch (error) {
      console.error('❌ Redis cache invalidation error:', error);
    }
  }
  
  /**
   * Revalidate both Next.js and Redis caches
   */
  async revalidateAll(tags: string[], patterns?: string[]): Promise<void> {
    try {
      // Revalidate Next.js cache
      await this.revalidateTags(tags);
      
      // Revalidate Redis cache
      if (patterns) {
        for (const pattern of patterns) {
          await this.revalidateRedisPattern(pattern);
        }
      }
      
      console.log('✅ Cache revalidation completed');
    } catch (error) {
      console.error('❌ Cache revalidation error:', error);
    }
  }
  
  /**
   * Revalidate enrollment-related caches
   */
  async revalidateEnrollments(cohortId?: string): Promise<void> {
    const tags = [CacheKeys.tags.enrollments, CacheKeys.tags.dashboard];
    const patterns = [
      'enrollments:*',
      'dashboard:*',
      ...(cohortId ? [`*cohort:${cohortId}*`] : [])
    ];
    
    await this.revalidateAll(tags, patterns);
  }
  
  /**
   * Revalidate applicant-related caches
   */
  async revalidateApplicants(cohortId?: string): Promise<void> {
    const tags = [CacheKeys.tags.applicants, CacheKeys.tags.dashboard];
    const patterns = [
      'applicants:*',
      'dashboard:*',
      ...(cohortId ? [`*cohort:${cohortId}*`] : [])
    ];
    
    await this.revalidateAll(tags, patterns);
  }
  
  /**
   * Revalidate statistics caches
   */
  async revalidateStatistics(cohortId?: string): Promise<void> {
    const tags = [CacheKeys.tags.statistics, CacheKeys.tags.dashboard];
    const patterns = [
      'statistics:*',
      'dashboard:*',
      ...(cohortId ? [`*cohort:${cohortId}*`] : [])
    ];
    
    await this.revalidateAll(tags, patterns);
  }
  
  /**
   * Revalidate user-specific caches
   */
  async revalidateUser(userEmail: string): Promise<void> {
    const tags = [CacheKeys.tags.users];
    const patterns = [
      `user:*${userEmail}*`,
      `*${userEmail}*`
    ];
    
    await this.revalidateAll(tags, patterns);
  }
  
  /**
   * Revalidate all caches (use sparingly)
   */
  async revalidateEverything(): Promise<void> {
    const tags = Object.values(CacheKeys.tags);
    const patterns = ['*'];
    
    await this.revalidateAll(tags, patterns);
  }
}

// Export singleton instance
export const cacheRevalidator = new CacheRevalidator();

/**
 * Helper function to revalidate caches after data changes
 */
export async function revalidateAfterChange(
  changeType: 'enrollment' | 'applicant' | 'statistics' | 'user',
  context?: { cohortId?: string; userEmail?: string }
): Promise<void> {
  try {
    switch (changeType) {
      case 'enrollment':
        await cacheRevalidator.revalidateEnrollments(context?.cohortId);
        break;
      case 'applicant':
        await cacheRevalidator.revalidateApplicants(context?.cohortId);
        break;
      case 'statistics':
        await cacheRevalidator.revalidateStatistics(context?.cohortId);
        break;
      case 'user':
        if (context?.userEmail) {
          await cacheRevalidator.revalidateUser(context.userEmail);
        }
        break;
      default:
        console.warn('Unknown change type:', changeType);
    }
  } catch (error) {
    console.error('❌ Cache revalidation error:', error);
  }
}
