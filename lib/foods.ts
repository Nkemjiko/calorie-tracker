export type FoodItem = {
  id: string
  name: string
  portion: string
  calories: number
  carbs: number
  protein: number
  fat: number
}

// Common Nigerian dishes with approximate values per typical serving.
export const NIGERIAN_FOODS: FoodItem[] = [
  { id: "jollof", name: "Jollof Rice", portion: "1 plate", calories: 480, carbs: 78, protein: 10, fat: 14 },
  { id: "egusi", name: "Egusi Soup", portion: "1 bowl", calories: 420, carbs: 12, protein: 22, fat: 32 },
  { id: "pounded-yam", name: "Pounded Yam", portion: "1 wrap", calories: 350, carbs: 80, protein: 4, fat: 1 },
  { id: "amala", name: "Amala & Ewedu", portion: "1 wrap", calories: 300, carbs: 68, protein: 5, fat: 2 },
  { id: "efo-riro", name: "Efo Riro", portion: "1 bowl", calories: 250, carbs: 10, protein: 14, fat: 18 },
  { id: "suya", name: "Beef Suya", portion: "1 stick", calories: 210, carbs: 4, protein: 26, fat: 11 },
  { id: "moi-moi", name: "Moi Moi", portion: "1 piece", calories: 180, carbs: 16, protein: 10, fat: 8 },
  { id: "akara", name: "Akara", portion: "3 balls", calories: 220, carbs: 18, protein: 9, fat: 13 },
  { id: "dodo", name: "Fried Plantain (Dodo)", portion: "1 serving", calories: 320, carbs: 48, protein: 2, fat: 14 },
  { id: "ewa-agoyin", name: "Ewa Agoyin", portion: "1 plate", calories: 360, carbs: 52, protein: 18, fat: 8 },
  { id: "pepper-soup", name: "Catfish Pepper Soup", portion: "1 bowl", calories: 190, carbs: 6, protein: 28, fat: 6 },
  { id: "ofada", name: "Ofada Rice & Ayamase", portion: "1 plate", calories: 520, carbs: 70, protein: 14, fat: 20 },
  { id: "nkwobi", name: "Nkwobi", portion: "1 bowl", calories: 380, carbs: 8, protein: 24, fat: 28 },
  { id: "boli", name: "Boli (Roasted Plantain)", portion: "1 serving", calories: 250, carbs: 60, protein: 2, fat: 1 },
  { id: "chin-chin", name: "Chin Chin", portion: "1 handful", calories: 300, carbs: 40, protein: 5, fat: 14 },
]

export type FastingProtocol = {
  id: string
  label: string
  description: string
  fastingHours: number
  eatingHours: number
}

export const FASTING_PROTOCOLS: FastingProtocol[] = [
  { id: "14-10", label: "14:10", description: "Beginner friendly", fastingHours: 14, eatingHours: 10 },
  { id: "16-8", label: "16:8", description: "Most popular", fastingHours: 16, eatingHours: 8 },
  { id: "18-6", label: "18:6", description: "Intermediate", fastingHours: 18, eatingHours: 6 },
  { id: "20-4", label: "20:4", description: "Warrior", fastingHours: 20, eatingHours: 4 },
  { id: "omad", label: "OMAD 23:1", description: "One meal a day", fastingHours: 23, eatingHours: 1 },
]

export const MEAL_TIMES = ["Breakfast", "Lunch", "Dinner", "Snack"] as const
export type MealTime = (typeof MEAL_TIMES)[number]
