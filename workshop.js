
'use strict';

// D.I.S.M.I.S. Mobile — Field Workshop Library
// Future knowledge source for Mimir

const WORKSHOP_TOPICS = [
  {
    id: 'water-collection',
    title: 'Emergency Water Collection',
    category: 'Water',
    tools: [
      'Clean containers',
      'Clean cloth',
      'Water treatment supplies'
    ],
    safety: 'Collected water must be treated before drinking. Do not use water suspected of chemical or fuel contamination.',
    steps: [
      'Identify the cleanest available water source.',
      'Avoid water with unusual odors, oily films, or nearby chemical contamination.',
      'Collect water in a clean container.',
      'Remove visible sediment using a clean cloth.',
      'Treat the water using an appropriate verified method before drinking.',
      'Store treated water in a clean, covered container.'
    ]
  },
  {
    id: 'emergency-shelter',
    title: 'Emergency Shelter Construction',
    category: 'Shelter',
    tools: [
      'Tarp or waterproof covering',
      'Cordage',
      'Insulating ground material'
    ],
    safety: 'Avoid flood zones, unstable trees, falling branches, and enclosed fuel-burning heaters.',
    steps: [
      'Choose stable ground away from obvious hazards.',
      'Identify the prevailing wind direction.',
      'Secure a waterproof covering against rain and wind.',
      'Insulate the sleeping area from the ground.',
      'Maintain ventilation.',
      'Inspect the shelter regularly for changing weather conditions.'
    ]
  }
];

window.DISMIS_WORKSHOP = WORKSHOP_TOPICS;
