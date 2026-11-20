// Lessons and guides: owner reviews each one before it ships. Numbers inside text come from config at render time.
export interface Lesson { id: string; title: string; group: string; reviewed: string | null; body: string[] }
export const lessons: Lesson[] = [
  { id: 'why-22k', title: 'Why jewellery is 22K', group: 'Gold basics', reviewed: null, body: ['Draft: 22K jewellery is 22 parts pure gold in 24, mixed with other metal so it is hard enough to wear. This lesson is pending the owner’s review.'] },
]
