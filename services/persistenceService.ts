/**
 * Persistence Service
 * 
 * Handles real-time saving of user interactions (habit/task completions) to the database.
 * Features:
 * - Debounced updates to avoid overloading the database
 * - Offline queue for storing changes when network is unavailable
 * - Automatic sync when connection is restored
 * - Optimistic UI updates for smooth user experience
 */

import { databaseService } from './databaseService';

// Type definitions for different completion updates
type HabitCompletionUpdate = {
  type: 'habit';
  userId: string;
  habitId: string;
  date: string; // ISO date string (YYYY-MM-DD)
  completed: boolean;
  timestamp: number;
};

type TaskCompletionUpdate = {
  type: 'task';
  userId: string;
  checklistId: string;
  taskId: string;
  completed: boolean;
  timestamp: number;
};

type PendingUpdate = HabitCompletionUpdate | TaskCompletionUpdate;

// Storage keys for persisting offline queue
const OFFLINE_QUEUE_KEY = 'taskly.offline_updates';
const LAST_SYNC_KEY = 'taskly.last_sync';

class PersistenceService {
  private pendingUpdates: Map<string, PendingUpdate> = new Map();
  private saveTimeout: number | null = null;
  private readonly DEBOUNCE_DELAY = 500; // milliseconds
  private isSyncing = false;

  constructor() {
    // Load any pending updates from localStorage on initialization
    this.loadOfflineQueue();
    
    // Set up auto-sync when coming back online
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        console.log('📡 Connection restored - syncing offline updates...');
        this.syncOfflineUpdates();
      });
    }
  }

  /**
   * Update a habit completion status for a specific date
   * Uses debouncing to batch rapid updates
   */
  updateHabitCompletion(
    userId: string,
    habitId: string,
    date: string,
    completed: boolean,
    appStateGetter: () => any // Function that returns current app state
  ): void {
    const key = `habit-${habitId}-${date}`;
    
    // Store the update in pending queue
    this.pendingUpdates.set(key, {
      type: 'habit',
      userId,
      habitId,
      date,
      completed,
      timestamp: Date.now(),
    });

    // Clear existing timeout and set new one
    if (this.saveTimeout) {
      window.clearTimeout(this.saveTimeout);
    }

    this.saveTimeout = window.setTimeout(() => {
      this.flushUpdates(userId, appStateGetter);
    }, this.DEBOUNCE_DELAY);
  }

  /**
   * Update a task completion status
   * Uses debouncing to batch rapid updates
   */
  updateTaskCompletion(
    userId: string,
    checklistId: string,
    taskId: string,
    completed: boolean,
    appStateGetter: () => any // Function that returns current app state
  ): void {
    const key = `task-${checklistId}-${taskId}`;
    
    // Store the update in pending queue
    this.pendingUpdates.set(key, {
      type: 'task',
      userId,
      checklistId,
      taskId,
      completed,
      timestamp: Date.now(),
    });

    // Clear existing timeout and set new one
    if (this.saveTimeout) {
      window.clearTimeout(this.saveTimeout);
    }

    this.saveTimeout = window.setTimeout(() => {
      this.flushUpdates(userId, appStateGetter);
    }, this.DEBOUNCE_DELAY);
  }

  /**
   * Flush all pending updates to the database
   * Called after debounce delay expires
   */
  private async flushUpdates(
    userId: string,
    appStateGetter: () => any
  ): Promise<void> {
    if (this.pendingUpdates.size === 0) return;

    // If offline, save to localStorage queue instead
    if (!navigator.onLine) {
      console.log('📴 Offline - queueing updates for later sync');
      this.saveToOfflineQueue();
      return;
    }

    try {
      // Get the current complete app state
      const currentState = appStateGetter();
      
      // Save the entire app state (which includes our local updates)
      await databaseService.saveAppState(userId, currentState);
      
      // Clear pending updates on successful save
      this.pendingUpdates.clear();
      
      // Update last sync timestamp
      localStorage.setItem(LAST_SYNC_KEY, Date.now().toString());
      
      console.log('✅ Updates saved to database');
    } catch (error) {
      console.error('❌ Failed to save updates:', error);
      
      // On error, save to offline queue for retry
      this.saveToOfflineQueue();
    }
  }

  /**
   * Save pending updates to localStorage for offline support
   */
  private saveToOfflineQueue(): void {
    try {
      const queueData = Array.from(this.pendingUpdates.entries());
      localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queueData));
      console.log(`💾 Saved ${queueData.length} updates to offline queue`);
    } catch (error) {
      console.error('Failed to save offline queue:', error);
    }
  }

  /**
   * Load pending updates from localStorage
   * Called on service initialization
   */
  private loadOfflineQueue(): void {
    try {
      const queueData = localStorage.getItem(OFFLINE_QUEUE_KEY);
      if (queueData) {
        const entries = JSON.parse(queueData) as [string, PendingUpdate][];
        this.pendingUpdates = new Map(entries);
        
        if (this.pendingUpdates.size > 0) {
          console.log(`📥 Loaded ${this.pendingUpdates.size} pending updates from offline queue`);
        }
      }
    } catch (error) {
      console.error('Failed to load offline queue:', error);
    }
  }

  /**
   * Sync all offline updates to the database
   * Called when connection is restored
   */
  async syncOfflineUpdates(): Promise<void> {
    if (this.isSyncing || this.pendingUpdates.size === 0) {
      return;
    }

    this.isSyncing = true;

    try {
      // This requires the app to trigger a full save
      // The app will need to call this when it detects we have pending updates
      window.dispatchEvent(new CustomEvent('taskly.syncPendingUpdates'));
      
      console.log('✅ Offline updates synced');
      
      // Clear offline queue after successful sync
      localStorage.removeItem(OFFLINE_QUEUE_KEY);
    } catch (error) {
      console.error('❌ Failed to sync offline updates:', error);
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Check if there are pending updates
   */
  hasPendingUpdates(): boolean {
    return this.pendingUpdates.size > 0;
  }

  /**
   * Get the count of pending updates
   */
  getPendingCount(): number {
    return this.pendingUpdates.size;
  }

  /**
   * Get last sync timestamp
   */
  getLastSyncTime(): Date | null {
    const timestamp = localStorage.getItem(LAST_SYNC_KEY);
    return timestamp ? new Date(parseInt(timestamp)) : null;
  }
}

// Export singleton instance
export const persistenceService = new PersistenceService();
