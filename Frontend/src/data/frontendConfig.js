// This file stores the configuration for the frontend home page, allow admins to update these via the CMS panel.
import Card1 from '../assets/Cards/Card1.jpg';
import Card2 from '../assets/Cards/Card2.jpg';
import Card3 from '../assets/Cards/Card3.jpg';

import BadmintonCard from '../assets/Category/BadmintonCard.png';
import TennisCard from '../assets/Category/TennisCard.png';

import Event1 from '../assets/Events/Events1 .jpeg';
import Event2 from '../assets/Events/Events2.jpeg';
import Event3 from '../assets/Events/Events3.jpeg';

export const HOME_CONFIG = {
  heroBanners: [
    {
      id: 1,
      title: "Join Tournament",
      subtitle: "30% off for new players",
      buttonText: "Join Match",
      image: Card1,
      link: '/events/1'
    },
    {
      id: 2,
      title: "Book Weekend Slots in Advance",
      subtitle: "Premium Courts Available",
      buttonText: "Book Now",
      image: Card2,
      link: '/arenas/1'
    },
    {
      id: 3,
      title: "Join Professional Coaching",
      subtitle: "Learn from the best",
      buttonText: "Learn More",
      image: Card3,
      link: '/coaching'
    }
  ],
  categories: [
    {
      id: 1,
      title: 'Badminton',
      image: BadmintonCard,
      link: '/arenas'
    },
    {
      id: 2,
      title: 'Table Tennis',
      image: TennisCard,
      link: '/arenas'
    }
  ],
  events: [
    {
      id: 1,
      title: 'Spring Camp',
      image: Event1,
      link: '/events/1'
    },
    {
      id: 2,
      title: 'Holiday Workshop',
      image: Event2,
      link: '/events/2'
    },
    {
      id: 3,
      title: 'Championship',
      image: Event3,
      link: '/events/3'
    }
  ]
};
