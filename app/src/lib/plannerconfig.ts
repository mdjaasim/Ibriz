// Limits and defaults for the planners. Rates, GST and deductions are NOT here: they come from rate.config.
export const plannerLimits = {
  periodsDefault: 6,
  periodsMax: 36,
  periodsMin: 2,
  budgetMax: 100000000,
  goalMaxYears: 15,
  daysPerWeek: 7,
  daysPerMonth: 30.44, // average month, used only to turn a deadline into a number of monthly payments
  intervals: [
    { id: 'week', label: 'Every week', unit: 'week', days: 7 },
    { id: 'month', label: 'Every month', unit: 'month', days: 30.44 },
  ],
  scenarioPct: 10, // staged-buying 'if the price were this much lower or higher' lines
  topMoves: 3, // how many biggest daily moves "What moved the price" lists
} as const
