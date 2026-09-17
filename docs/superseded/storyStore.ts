// ============================================================
// IEEE COMMITTEE — Story State Store (Zustand)
// ============================================================
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { ChapterId } from '@/data/types'

// ----------------------------------------------------------
// Types
// ----------------------------------------------------------
interface StoryState {
  currentChapter: ChapterId
  completedChapters: ChapterId[]
  userChoices: Record<string, string>   // choiceGroupId → selectedOptionId
  progressPercent: number               // 0–100
  preferredDomainId: string | null      // Set from story choice in Chapter 1

  // Actions
  setChapter: (id: ChapterId) => void
  completeChapter: (id: ChapterId) => void
  recordChoice: (groupId: string, optionId: string, domainId?: string) => void
  setProgress: (pct: number) => void
  reset: () => void
}

// ----------------------------------------------------------
// Initial State
// ----------------------------------------------------------
const initialState = {
  currentChapter: 'hero' as ChapterId,
  completedChapters: [] as ChapterId[],
  userChoices: {} as Record<string, string>,
  progressPercent: 0,
  preferredDomainId: null as string | null,
}

// ----------------------------------------------------------
// Store
// ----------------------------------------------------------
export const useStoryStore = create<StoryState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setChapter: (id) => {
        set({ currentChapter: id })
      },

      completeChapter: (id) => {
        const { completedChapters } = get()
        if (!completedChapters.includes(id)) {
          set({ completedChapters: [...completedChapters, id] })
        }
      },

      recordChoice: (groupId, optionId, domainId) => {
        set((state) => ({
          userChoices: { ...state.userChoices, [groupId]: optionId },
          ...(domainId ? { preferredDomainId: domainId } : {}),
        }))
      },

      setProgress: (pct) => {
        set({ progressPercent: Math.min(100, Math.max(0, pct)) })
      },

      reset: () => set(initialState),
    }),
    {
      name: 'ieee-story-progress',
      storage: createJSONStorage(() => sessionStorage),
      // Only persist these keys — don't persist progress % (recalculate on reload)
      partialize: (state) => ({
        completedChapters: state.completedChapters,
        userChoices: state.userChoices,
        preferredDomainId: state.preferredDomainId,
      }),
    }
  )
)

// ----------------------------------------------------------
// Selectors (memoised access patterns)
// ----------------------------------------------------------
export const selectIsChapterCompleted = (id: ChapterId) =>
  (state: StoryState) => state.completedChapters.includes(id)

export const selectUserChoice = (groupId: string) =>
  (state: StoryState) => state.userChoices[groupId] ?? null

export const selectPersonalisedGreeting = (state: StoryState): string => {
  const domain = state.preferredDomainId
  if (domain === 'cs')    return 'Your path in computing starts here.'
  if (domain === 'pes')   return 'Ready to power the future?'
  if (domain === 'ras')   return 'The machines are waiting for you.'
  if (domain === 'embs')  return 'Engineering at the edge of life.'
  return 'Your signal starts here.'
}
