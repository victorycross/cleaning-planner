import { type Frequency } from './types'

export interface LibraryTask {
  title: string
  roomId: string
  frequency: Frequency
  notes: string
}

export const TASK_LIBRARY: LibraryTask[] = [
  // Kitchen
  { title: 'Wipe stovetop', roomId: 'kitchen', frequency: 'daily', notes: '' },
  { title: 'Wipe benchtops', roomId: 'kitchen', frequency: 'daily', notes: '' },
  { title: 'Clean sink', roomId: 'kitchen', frequency: 'daily', notes: '' },
  { title: 'Wash dishes / run dishwasher', roomId: 'kitchen', frequency: 'daily', notes: '' },
  { title: 'Empty bin', roomId: 'kitchen', frequency: 'weekly', notes: '' },
  { title: 'Wipe cabinet fronts', roomId: 'kitchen', frequency: 'weekly', notes: '' },
  { title: 'Clean microwave inside and out', roomId: 'kitchen', frequency: 'weekly', notes: '' },
  { title: 'Mop floor', roomId: 'kitchen', frequency: 'weekly', notes: '' },
  { title: 'Clean rangehood filter', roomId: 'kitchen', frequency: 'monthly', notes: 'Soak in hot soapy water.' },
  { title: 'Wipe fridge exterior', roomId: 'kitchen', frequency: 'monthly', notes: '' },
  { title: 'Clean fridge interior', roomId: 'kitchen', frequency: 'monthly', notes: 'Remove shelves and wipe down.' },
  { title: 'Clean oven', roomId: 'kitchen', frequency: 'quarterly', notes: 'Use oven cleaner or baking soda paste.' },
  { title: 'Defrost and clean freezer', roomId: 'kitchen', frequency: 'biannual', notes: '' },
  { title: 'Clean behind and under fridge', roomId: 'kitchen', frequency: 'biannual', notes: '' },

  // Bathroom
  { title: 'Wipe sink and tap', roomId: 'bathroom', frequency: 'weekly', notes: '' },
  { title: 'Clean toilet', roomId: 'bathroom', frequency: 'weekly', notes: 'Bowl, seat, lid, and base.' },
  { title: 'Clean shower or bath', roomId: 'bathroom', frequency: 'weekly', notes: '' },
  { title: 'Mop floor', roomId: 'bathroom', frequency: 'weekly', notes: '' },
  { title: 'Clean mirror', roomId: 'bathroom', frequency: 'weekly', notes: '' },
  { title: 'Replace towels', roomId: 'bathroom', frequency: 'weekly', notes: '' },
  { title: 'Descale showerhead', roomId: 'bathroom', frequency: 'monthly', notes: 'Soak in white vinegar.' },
  { title: 'Wipe bathroom cabinet and shelves', roomId: 'bathroom', frequency: 'monthly', notes: '' },
  { title: 'Scrub grout', roomId: 'bathroom', frequency: 'quarterly', notes: 'Use a grout brush and cleaner.' },
  { title: 'Wash shower curtain or clean screen', roomId: 'bathroom', frequency: 'monthly', notes: '' },
  { title: 'Check and restock toiletries', roomId: 'bathroom', frequency: 'monthly', notes: '' },

  // Living Room
  { title: 'Vacuum floors', roomId: 'living', frequency: 'weekly', notes: '' },
  { title: 'Dust surfaces and shelves', roomId: 'living', frequency: 'weekly', notes: '' },
  { title: 'Wipe down coffee table', roomId: 'living', frequency: 'weekly', notes: '' },
  { title: 'Empty bins', roomId: 'living', frequency: 'weekly', notes: '' },
  { title: 'Vacuum sofa and cushions', roomId: 'living', frequency: 'fortnightly', notes: '' },
  { title: 'Wipe TV and electronics', roomId: 'living', frequency: 'fortnightly', notes: 'Use a dry microfibre cloth on screens.' },
  { title: 'Clean windows and sills', roomId: 'living', frequency: 'monthly', notes: '' },
  { title: 'Dust blinds or wipe skirting boards', roomId: 'living', frequency: 'monthly', notes: '' },
  { title: 'Clean light switches and door handles', roomId: 'living', frequency: 'monthly', notes: '' },
  { title: 'Deep clean carpet or rugs', roomId: 'living', frequency: 'biannual', notes: '' },
  { title: 'Wash curtains or dry-clean drapes', roomId: 'living', frequency: 'yearly', notes: '' },

  // Bedroom
  { title: 'Make bed', roomId: 'bedroom', frequency: 'daily', notes: '' },
  { title: 'Change bed linen', roomId: 'bedroom', frequency: 'weekly', notes: '' },
  { title: 'Vacuum floor', roomId: 'bedroom', frequency: 'weekly', notes: '' },
  { title: 'Dust bedside tables and surfaces', roomId: 'bedroom', frequency: 'fortnightly', notes: '' },
  { title: 'Clean mirrors', roomId: 'bedroom', frequency: 'fortnightly', notes: '' },
  { title: 'Clean windows and sills', roomId: 'bedroom', frequency: 'monthly', notes: '' },
  { title: 'Wipe skirting boards', roomId: 'bedroom', frequency: 'monthly', notes: '' },
  { title: 'Rotate mattress', roomId: 'bedroom', frequency: 'biannual', notes: 'Also vacuum mattress surface.' },
  { title: 'Declutter wardrobe', roomId: 'bedroom', frequency: 'yearly', notes: '' },
  { title: 'Wash pillows and duvet', roomId: 'bedroom', frequency: 'biannual', notes: '' },

  // Laundry
  { title: 'Do laundry', roomId: 'laundry', frequency: 'weekly', notes: '' },
  { title: 'Clean lint trap', roomId: 'laundry', frequency: 'weekly', notes: 'Clean after every load ideally.' },
  { title: 'Wipe down washer and dryer exterior', roomId: 'laundry', frequency: 'monthly', notes: '' },
  { title: 'Run washing machine cleaning cycle', roomId: 'laundry', frequency: 'monthly', notes: 'Use a machine cleaner tablet or white vinegar.' },
  { title: 'Clean laundry sink', roomId: 'laundry', frequency: 'monthly', notes: '' },
  { title: 'Check and clean dryer duct', roomId: 'laundry', frequency: 'biannual', notes: 'Lint buildup is a fire hazard.' },

  // Outdoor
  { title: 'Mow lawn', roomId: 'outdoor', frequency: 'weekly', notes: '' },
  { title: 'Sweep paths and patio', roomId: 'outdoor', frequency: 'weekly', notes: '' },
  { title: 'Water plants', roomId: 'outdoor', frequency: 'weekly', notes: '' },
  { title: 'Weed garden beds', roomId: 'outdoor', frequency: 'monthly', notes: '' },
  { title: 'Trim hedges and edges', roomId: 'outdoor', frequency: 'monthly', notes: '' },
  { title: 'Clean outdoor furniture', roomId: 'outdoor', frequency: 'monthly', notes: '' },
  { title: 'Clean BBQ grill', roomId: 'outdoor', frequency: 'monthly', notes: '' },
  { title: 'Clear gutters', roomId: 'outdoor', frequency: 'biannual', notes: 'Spring and autumn.' },
  { title: 'Pressure wash paths and driveway', roomId: 'outdoor', frequency: 'yearly', notes: '' },
  { title: 'Check and service garden tools', roomId: 'outdoor', frequency: 'yearly', notes: '' },
]

export function getLibraryTasksForRoom(roomId: string): LibraryTask[] {
  return TASK_LIBRARY.filter(t => t.roomId === roomId)
}
