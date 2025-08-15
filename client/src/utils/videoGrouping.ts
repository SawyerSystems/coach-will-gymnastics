/**
 * Utility functions for grouping videos by local day for the stacked video UI.
 */

export interface VideoItem {
  id: number;
  url?: string | null;
  title?: string | null;
  recordedAt?: string | Date | null;
  [key: string]: any; // Allow additional properties
}

export interface VideoGroup {
  dayKey: string;
  dateLabel: string;
  videos: VideoItem[];
  coverVideo: VideoItem;
}

/**
 * Converts a video's timestamp to a local day key (YYYY-MM-DD).
 * Always uses the viewer's local timezone to avoid UTC midnight bugs.
 */
export function getLocalDayKey(video: VideoItem): string {
  const timestamp = video.recordedAt || (video as any).createdAt;
  if (!timestamp) return 'Unknown';
  
  try {
    const date = new Date(timestamp as any);
    if (isNaN(date.getTime())) return 'Unknown';
    
    // Use local timezone by getting year, month, day components separately
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  } catch {
    return 'Unknown';
  }
}

/**
 * Formats a day key (YYYY-MM-DD) into a user-friendly date label.
 * Uses locale-aware formatting with short month names.
 */
export function formatDateLabel(dayKey: string): string {
  if (dayKey === 'Unknown') return 'Unknown Date';
  
  try {
    // Parse the day key and create a date at local midnight
    const [year, month, day] = dayKey.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    
    return date.toLocaleDateString(undefined, {
      month: 'short', // "Aug"
      day: 'numeric', // "14"
      year: 'numeric' // "2025"
    });
  } catch {
    return dayKey;
  }
}

/**
 * Groups videos by local day and returns sorted groups.
 * 
 * @param videos Array of video items to group
 * @returns Array of VideoGroup objects, sorted by date descending (newest first)
 */
export function groupVideosByDay(videos: VideoItem[]): VideoGroup[] {
  if (!videos.length) return [];
  
  // Group videos by day key
  const groupMap = new Map<string, VideoItem[]>();
  
  for (const video of videos) {
    const dayKey = getLocalDayKey(video);
    if (!groupMap.has(dayKey)) {
      groupMap.set(dayKey, []);
    }
    groupMap.get(dayKey)!.push(video);
  }
  
  // Convert to array and sort
  const groups: VideoGroup[] = [];
  
  // Get all group entries and process them
  const groupEntries = Array.from(groupMap.entries());
  
  for (let i = 0; i < groupEntries.length; i++) {
    const [dayKey, dayVideos] = groupEntries[i];
    // Sort videos within the day by timestamp descending (newest first)
    const sortedVideos = [...dayVideos].sort((a, b) => {
      const timestampA = a.recordedAt || (a as any).createdAt;
      const timestampB = b.recordedAt || (b as any).createdAt;
      
      if (!timestampA && !timestampB) return (b.id || 0) - (a.id || 0);
      if (!timestampA) return 1;
      if (!timestampB) return -1;
      
      try {
        const dateA = new Date(timestampA as any).getTime();
        const dateB = new Date(timestampB as any).getTime();
        return dateB - dateA; // Descending order
      } catch {
        return (b.id || 0) - (a.id || 0);
      }
    });
    
    groups.push({
      dayKey,
      dateLabel: formatDateLabel(dayKey),
      videos: sortedVideos,
      coverVideo: sortedVideos[0] // Newest video is the cover
    });
  }
  
  // Sort groups by date descending (newest day first)
  // Handle 'Unknown' day by placing it at the end
  groups.sort((a, b) => {
    if (a.dayKey === 'Unknown' && b.dayKey === 'Unknown') return 0;
    if (a.dayKey === 'Unknown') return 1;
    if (b.dayKey === 'Unknown') return -1;
    
    return b.dayKey.localeCompare(a.dayKey); // String comparison works for YYYY-MM-DD
  });
  
  return groups;
}

/**
 * Returns the groups that should be visible in the skill card (at most 2).
 */
export function getVisibleGroups(groups: VideoGroup[]): VideoGroup[] {
  return groups.slice(0, 2);
}

/**
 * Returns whether the "See more" control should be shown.
 */
export function shouldShowSeeMore(groups: VideoGroup[]): boolean {
  return groups.length > 2;
}
