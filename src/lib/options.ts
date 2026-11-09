export const SYMPTOMS = [
  'Skin rash or itching',
  'Swelling of face or lips',
  'Vomiting',
  'Diarrhoea',
  'Stomach pain',
  'Dizziness',
  'Headache',
  'Fast heartbeat',
  'Blurred vision',
  'Yellow eyes or skin',
  'Dark or little urine',
  'Unusual bleeding',
]

/** Signs that mean the person should get care now, whatever the cause. */
export const WARNING_SIGNS = [
  'Trouble breathing',
  'Swelling of the face, lips or throat',
  'Fainting or fits (convulsions)',
  'Yellow eyes or skin',
  'Very little or no urine',
  'Heavy bleeding',
  'Admitted to hospital',
]

export const BOUGHT_FROM = [
  'Herbal shop',
  'Herbalist or herbal clinic',
  'Pharmacy or chemical shop',
  'Market or street seller',
  'Bus or lorry station seller',
  'Online or social media',
  'Hospital herbal unit',
  'Made at home or given by family',
  'Other',
]

export const SUSPICIOUS_ISSUES = [
  'No FDA registration number on the pack',
  'Registration number looks fake or copied',
  'I think it contains something not on the label',
  'Advert makes claims that sound false or dangerous',
  'Expired, damaged or badly sealed',
  'Other',
]

export const TOWNS = ['Accra', 'Tema', 'Kasoa', 'Madina', 'Kumasi', 'Obuasi', 'Ejisu', 'Other']

export function toggle<T>(list: T[], item: T): T[] {
  return list.includes(item) ? list.filter((x) => x !== item) : [...list, item]
}
