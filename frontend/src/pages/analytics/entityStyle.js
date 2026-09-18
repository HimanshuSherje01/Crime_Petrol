export const TYPE_COLORS = {
  PERSON: '#06B6D4',
  PHONE: '#A855F7',
  LOCATION: '#10B981',
  VEHICLE: '#F97316',
  BANK: '#F59E0B',
  FIR: '#EF4444',
  CCTV: '#3B82F6',
  ORG: '#8B5CF6',
  AUDIO: '#EC4899',
  DATASET: '#22D3EE',
  DEFAULT: '#94A3B8'
}

export const TYPE_LABELS = {
  PERSON: 'Person',
  PHONE: 'Phone',
  LOCATION: 'Location',
  VEHICLE: 'Vehicle',
  BANK: 'Bank / Financial',
  FIR: 'FIR / Case',
  CCTV: 'CCTV',
  ORG: 'Organization',
  AUDIO: 'Audio',
  DATASET: 'Dataset'
}

export function typeColor(type) {
  return TYPE_COLORS[(type || '').toUpperCase()] || TYPE_COLORS.DEFAULT
}

export function typeLabel(type) {
  return TYPE_LABELS[(type || '').toUpperCase()] || type || 'Other'
}

export const COMMUNITY_COLORS = [
  '#06B6D4', '#8B5CF6', '#F97316', '#10B981', '#EF4444',
  '#3B82F6', '#EC4899', '#F59E0B', '#22D3EE', '#94A3B8',
]