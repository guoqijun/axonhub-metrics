import { create } from 'zustand'
import dayjs from 'dayjs'

export interface FilterState {
  dateRange: [dayjs.Dayjs, dayjs.Dayjs]
  granularity: 'day' | 'week' | 'month'
  userIds: string[]
  channelIds: number[]
  modelIds: string[]
  projectId: number | null
  setDateRange: (range: [dayjs.Dayjs, dayjs.Dayjs]) => void
  setGranularity: (g: 'day' | 'week' | 'month') => void
  setUserIds: (ids: string[]) => void
  setChannelIds: (ids: number[]) => void
  setModelIds: (ids: string[]) => void
  setProjectId: (id: number | null) => void
  resetFilters: () => void
}

const defaultRange: [dayjs.Dayjs, dayjs.Dayjs] = [
  dayjs().subtract(30, 'day'),
  dayjs(),
]

export const useFilterStore = create<FilterState>((set) => ({
  dateRange: defaultRange,
  granularity: 'day',
  userIds: [],
  channelIds: [],
  modelIds: [],
  projectId: null,
  setDateRange: (range) => set({ dateRange: range }),
  setGranularity: (granularity) => set({ granularity }),
  setUserIds: (userIds) => set({ userIds }),
  setChannelIds: (channelIds) => set({ channelIds }),
  setModelIds: (modelIds) => set({ modelIds }),
  setProjectId: (projectId) => set({ projectId }),
  resetFilters: () =>
    set({
      dateRange: defaultRange,
      granularity: 'day',
      userIds: [],
      channelIds: [],
      modelIds: [],
      projectId: null,
    }),
}))
