import aaravImg from './assets/stylist_aarav.png'
import priyaImg from './assets/stylist_priya.png'
import vikramImg from './assets/stylist_vikram.png'
import ananyaImg from './assets/stylist_ananya.png'
import kabirImg from './assets/stylist_kabir.png'
import meeraImg from './assets/stylist_meera.png'

import model1Img from './assets/model_1.png'
import model2Img from './assets/model_2.png'
import model3Img from './assets/model_3.png'
import model4Img from './assets/model_4.png'

export const stylists = [
  {
    id: 'aarav-mehta',
    name: 'Aarav Mehta',
    role: 'Senior Hair Sculptor',
    rating: 4.9,
    reviews: 182,
    image: aaravImg,
    specialization: 'Hair Styling & Grooming',
    bio: 'Aarav is a master craftsman with over 10 years of experience sculpting locks for high-fashion runways and premium salons. He believes that a haircut should enhance one\'s natural bone structure and personal style.',
    skills: [
      'Couture Hair Sculpting',
      'Royal Beard Design & Razor Lineup',
      'Scalp Rejuvenation Therapy',
      'Precision Scissor Work'
    ],
    availability: 'Mon - Fri, 10:00 AM - 7:00 PM',
    availableHours: ['10:00 AM', '11:30 AM', '1:00 PM', '3:00 PM', '4:30 PM', '6:00 PM'],
    services: [
      { id: 'hc-royal', name: 'Royal Signature Haircut', price: 1500, duration: '45 mins' },
      { id: 'bt-luxury', name: 'Luxury Beard Trim & Sculpt', price: 800, duration: '30 mins' },
      { id: 'sv-royal', name: 'Royal Shave with Hot Towel', price: 1000, duration: '40 mins' },
      { id: 'sp-detox', name: 'Premium Scalp Detox & Massage', price: 1800, duration: '60 mins' }
    ]
  },
  {
    id: 'priya-sharma',
    name: 'Priya Sharma',
    role: 'Master Colorist & Stylist',
    rating: 4.8,
    reviews: 215,
    image: priyaImg,
    specialization: 'Hair Coloring & Styling',
    bio: 'Priya is a celebrated colorist specializing in bespoke balayage, color corrections, and couture hair artistry. Trained in Paris, she treats hair as a canvas to create multi-dimensional masterpieces.',
    skills: [
      'Bespoke Handpainted Balayage',
      'Creative Fashion Coloring',
      'Advanced Keratin Infusions',
      'Red Carpet & Bridal Hair Design'
    ],
    availability: 'Wed - Mon, 11:00 AM - 8:00 PM',
    availableHours: ['11:00 AM', '1:30 PM', '3:30 PM', '5:30 PM', '7:00 PM'],
    services: [
      { id: 'by-bespoke', name: 'Couture Balayage & Styling', price: 6500, duration: '150 mins' },
      { id: 'cl-global', name: 'Luxury Global Hair Color', price: 4500, duration: '90 mins' },
      { id: 'kt-infusion', name: 'Vance Keratin Infusion', price: 5000, duration: '120 mins' },
      { id: 'st-bridal', name: 'Red Carpet Hair Design', price: 2500, duration: '60 mins' }
    ]
  },
  {
    id: 'vikram-singh',
    name: 'Vikram Singh',
    role: 'Skin & Grooming Specialist',
    rating: 4.7,
    reviews: 143,
    image: vikramImg,
    specialization: 'Skincare & Wellness',
    bio: 'With deep knowledge of dermal science and holistic skincare, Vikram provides tailored facial and scalp therapies. He is dedicated to restoring and maintaining skin vitality using ultra-premium botanicals.',
    skills: [
      'Advanced Skin Analysis',
      'Deep Dermal Hydration',
      'Micro-peel Treatments',
      'Anti-Aging Facial Sculpting'
    ],
    availability: 'Thu - Tue, 10:00 AM - 6:30 PM',
    availableHours: ['10:00 AM', '11:30 AM', '1:30 PM', '3:00 PM', '4:30 PM'],
    services: [
      { id: 'fc-gold', name: 'Gold Dust Dermal Glow Facial', price: 4000, duration: '75 mins' },
      { id: 'fc-hydra', name: 'Hydra-Boost Intense Therapy', price: 3500, duration: '60 mins' },
      { id: 'fc-detox', name: 'Charcoal Skin Detox Facial', price: 2500, duration: '50 mins' },
      { id: 'sp-scalp', name: 'Ultimate Scalp Acupressure Spa', price: 2000, duration: '45 mins' }
    ]
  },
  {
    id: 'ananya-sen',
    name: 'Ananya Sen',
    role: 'Nail & Lash Artist',
    rating: 4.9,
    reviews: 96,
    image: ananyaImg,
    specialization: 'Nails & Lash Design',
    bio: 'Ananya is a visionary artist who converts nails into miniature canvases. With a sharp eye for detail and styling, she also specializes in gorgeous, weightless lash extensions that beautifully define the eyes.',
    skills: [
      'Handpainted Gel Nail Art',
      'Premium Gel & Acrylic Extensions',
      'Silk Lash Lift & Volume Extensions',
      'Paraffin Hand Spa & Care'
    ],
    availability: 'Daily, 10:00 AM - 8:00 PM',
    availableHours: ['10:00 AM', '12:00 PM', '2:00 PM', '4:00 PM', '6:00 PM'],
    services: [
      { id: 'nl-gelart', name: 'Bespoke Handpainted Gel Art', price: 2200, duration: '60 mins' },
      { id: 'nl-extend', name: 'Full Set Gel Nail Extensions', price: 3000, duration: '90 mins' },
      { id: 'ls-russian', name: 'Premium Russian Lash Extensions', price: 4500, duration: '120 mins' },
      { id: 'nl-spa', name: 'Luxurious Paraffin Hand & Arm Spa', price: 1500, duration: '45 mins' }
    ]
  },
  {
    id: 'kabir-malhotra',
    name: 'Kabir Malhotra',
    role: 'Master Barber',
    rating: 4.8,
    reviews: 112,
    image: kabirImg,
    specialization: 'Barbering & Grooming',
    bio: 'Kabir is a specialist in old-school shaves, precision hair design, and head relaxation therapies. With 8 years of experience, he brings classic barbering styles into the luxury era.',
    skills: [
      'Classic Hot Towel Shave',
      'Hair Styling & Lineups',
      'Therapeutic Head Massage',
      'Beard Sculpting & Trim'
    ],
    availability: 'Mon - Sat, 9:30 AM - 8:00 PM',
    availableHours: ['9:30 AM', '11:00 AM', '12:30 PM', '2:30 PM', '4:00 PM', '5:30 PM', '7:00 PM'],
    services: [
      { id: 'bb-haircut', name: 'Royal Scissor Haircut', price: 1200, duration: '45 mins' },
      { id: 'bb-shave', name: 'Classic Hot Towel Shave', price: 700, duration: '35 mins' },
      { id: 'bb-groom', name: 'Luxury Beard Grooming & Trim', price: 600, duration: '30 mins' },
      { id: 'bb-massage', name: 'Head Acupressure & Spa Massage', price: 1100, duration: '40 mins' }
    ]
  },
  {
    id: 'meera-iyer',
    name: 'Meera Iyer',
    role: 'Spa & Scalp Therapist',
    rating: 4.9,
    reviews: 88,
    image: meeraImg,
    specialization: 'Hair Spa & Wellness',
    bio: 'Meera is an expert in hair spa rituals and customized scalp treatments. She uses organic essential oils and high-quality hair masks to revitalize damaged hair and soothe the mind.',
    skills: [
      'Bespoke Hair Spa Rituals',
      'Scalp Rebalancing Therapy',
      'Ayurvedic Head Therapy',
      'Deep Conditioning Masks'
    ],
    availability: 'Fri - Wed, 10:00 AM - 7:30 PM',
    availableHours: ['10:00 AM', '11:45 AM', '1:30 PM', '3:15 PM', '5:00 PM', '6:30 PM'],
    services: [
      { id: 'sp-oil', name: 'Organic Essential Oil Hair Spa', price: 2800, duration: '60 mins' },
      { id: 'sp-fall', name: 'Anti-Hairfall Treatment Ritual', price: 3200, duration: '75 mins' },
      { id: 'sp-dand', name: 'Dandruff Rebalancing Treatment', price: 2500, duration: '50 mins' },
      { id: 'sp-mask', name: 'Deep Conditioning Nourishing Mask', price: 2000, duration: '45 mins' }
    ]
  }
]

export const models = [
  {
    id: 'model-1',
    name: 'Aditi',
    ethnicity: 'Indian',
    style: 'Couture Caramel Balayage',
    stylistId: 'priya-sharma',
    stylistName: 'Priya Sharma',
    image: model1Img,
    desc: 'Multi-dimensional caramel and bronze handpainted balayage with loose beach waves.'
  },
  {
    id: 'model-2',
    name: 'Elena',
    ethnicity: 'White',
    style: 'Chic Textured Platinum Bob',
    stylistId: 'aarav-mehta',
    stylistName: 'Aarav Mehta',
    image: model2Img,
    desc: 'A modern, sharp textured bob styled with volume and finished with a cooling platinum toner.'
  },
  {
    id: 'model-3',
    name: 'Kavya',
    ethnicity: 'Indian',
    style: 'Royal Bridal Couture Braid',
    stylistId: 'priya-sharma',
    stylistName: 'Priya Sharma',
    image: model3Img,
    desc: 'Intricate traditional bridal hairstyle woven with delicate gold pins and fresh blossoms.'
  },
  {
    id: 'model-4',
    name: 'Charlotte',
    ethnicity: 'White',
    style: 'Voluminous Copper Waves',
    stylistId: 'aarav-mehta',
    stylistName: 'Aarav Mehta',
    image: model4Img,
    desc: 'Rich copper-red coloring with high gloss and deep volume curls.'
  }
]

export const salons = [
  {
    id: 'aura-koramangala',
    name: 'Aura Salon & Spa',
    location: 'Koramangala',
    coordinates: [12.9352, 77.6244],
    stylistIds: ['aarav-mehta', 'priya-sharma'],
    priceTier: '₹₹₹',
    priceRange: '₹1,500 - ₹6,500',
    rating: 4.9,
    luxuryLevel: 'Ultra Luxury',
    homeService: true,
    services: [
      { id: 'hc-royal', name: 'Royal Signature Haircut', price: 1500, category: 'Haircut' },
      { id: 'bt-luxury', name: 'Luxury Beard Trim & Sculpt', price: 800, category: 'Barbering' },
      { id: 'sv-royal', name: 'Royal Shave with Hot Towel', price: 1000, category: 'Barbering' },
      { id: 'sp-detox', name: 'Premium Scalp Detox & Massage', price: 1800, category: 'Hair Spa' },
      { id: 'by-bespoke', name: 'Couture Balayage & Styling', price: 6500, category: 'Coloring' },
      { id: 'cl-global', name: 'Luxury Global Hair Color', price: 4500, category: 'Coloring' },
      { id: 'st-bridal', name: 'Red Carpet Hair Design', price: 2500, category: 'Bridal' }
    ],
    amenities: ['Valet Parking', 'Free Wi-Fi', 'Complimentary Champagne', 'VIP Lounge'],
    reviews: [
      { author: 'Rohan Sen', text: 'Incredible experience, Priya\'s balayage is absolutely top notch! Best in Koramangala.', rating: 5, date: '2026-06-15' },
      { author: 'Ananya Roy', text: 'Loved the royal signature haircut by Aarav. Highly recommend! The Champagne was a nice touch.', rating: 5, date: '2026-06-20' }
    ]
  },
  {
    id: 'vogue-indiranagar',
    name: 'Vogue Artistry',
    location: 'Indiranagar',
    coordinates: [12.9784, 77.6408],
    stylistIds: ['priya-sharma', 'vikram-singh'],
    priceTier: '₹₹',
    priceRange: '₹2,000 - ₹5,000',
    rating: 4.8,
    luxuryLevel: 'Premium',
    homeService: false,
    services: [
      { id: 'by-bespoke', name: 'Couture Balayage & Styling', price: 6500, category: 'Coloring' },
      { id: 'cl-global', name: 'Luxury Global Hair Color', price: 4500, category: 'Coloring' },
      { id: 'kt-infusion', name: 'Vance Keratin Infusion', price: 5000, category: 'Hair Spa' },
      { id: 'fc-gold', name: 'Gold Dust Dermal Glow Facial', price: 4000, category: 'Skincare' },
      { id: 'fc-hydra', name: 'Hydra-Boost Intense Therapy', price: 3500, category: 'Skincare' }
    ],
    amenities: ['Free Wi-Fi', 'Aroma Therapy Rooms', 'Beverage Bar'],
    reviews: [
      { author: 'Siddharth M.', text: 'Great grooming service by Vikram. Very professional skin analyst.', rating: 5, date: '2026-06-18' },
      { author: 'Meera Iyer', text: 'Loved the global color by Priya. Great ambiance but a bit hard to find parking.', rating: 4, date: '2026-06-22' }
    ]
  },
  {
    id: 'royale-whitefield',
    name: 'The Royale Grooming',
    location: 'Whitefield',
    coordinates: [12.9698, 77.7500],
    stylistIds: ['kabir-malhotra', 'vikram-singh'],
    priceTier: '₹₹₹',
    priceRange: '₹1,200 - ₹4,000',
    rating: 4.7,
    luxuryLevel: 'Ultra Luxury',
    homeService: true,
    services: [
      { id: 'bb-haircut', name: 'Royal Scissor Haircut', price: 1200, category: 'Haircut' },
      { id: 'bb-shave', name: 'Classic Hot Towel Shave', price: 700, category: 'Barbering' },
      { id: 'bb-groom', name: 'Luxury Beard Grooming & Trim', price: 600, category: 'Barbering' },
      { id: 'bb-massage', name: 'Head Acupressure & Spa Massage', price: 1100, category: 'Hair Spa' },
      { id: 'fc-gold', name: 'Gold Dust Dermal Glow Facial', price: 4000, category: 'Skincare' }
    ],
    amenities: ['Valet Parking', 'Private Cabins', 'Massage Chairs'],
    reviews: [
      { author: 'Varun Nair', text: 'The classic hot shave by Kabir is the best in Bangalore. Felt like royalty.', rating: 5, date: '2026-06-10' },
      { author: 'Nisha K.', text: 'Very calming skin facial treatments by Vikram. The massage chairs are incredibly relaxing.', rating: 4, date: '2026-06-14' }
    ]
  },
  {
    id: 'nail-jayanagar',
    name: 'Nail Couture & Lash Studio',
    location: 'Jayanagar',
    coordinates: [12.9307, 77.5824],
    stylistIds: ['ananya-sen', 'meera-iyer'],
    priceTier: '₹',
    priceRange: '₹1,500 - ₹3,000',
    rating: 4.9,
    luxuryLevel: 'Premium',
    homeService: false,
    services: [
      { id: 'nl-gelart', name: 'Bespoke Handpainted Gel Art', price: 2200, category: 'Nails' },
      { id: 'nl-extend', name: 'Full Set Gel Nail Extensions', price: 3000, category: 'Nails' },
      { id: 'ls-russian', name: 'Premium Russian Lash Extensions', price: 4500, category: 'Lashes' },
      { id: 'nl-spa', name: 'Luxurious Paraffin Hand & Arm Spa', price: 1500, category: 'Nails' }
    ],
    amenities: ['Free Wi-Fi', 'Complimentary Coffee', 'Nail Bar Lounge'],
    reviews: [
      { author: 'Deepika Rao', text: 'Ananya is an absolute artist! My custom gel nail extensions look stunning. Got so many compliments.', rating: 5, date: '2026-06-08' },
      { author: 'Sneha Hegde', text: 'Incredible paraffin spa treatment by Meera. The studio smells lovely.', rating: 5, date: '2026-06-12' }
    ]
  },
  {
    id: 'elixir-sadashivanagar',
    name: 'Elixir Wellness',
    location: 'Sadashivanagar',
    coordinates: [13.0068, 77.5813],
    stylistIds: ['meera-iyer', 'aarav-mehta'],
    priceTier: '₹₹₹',
    priceRange: '₹1,500 - ₹3,200',
    rating: 4.9,
    luxuryLevel: 'Ultra Luxury',
    homeService: true,
    services: [
      { id: 'sp-oil', name: 'Organic Essential Oil Hair Spa', price: 2800, category: 'Hair Spa' },
      { id: 'sp-fall', name: 'Anti-Hairfall Treatment Ritual', price: 3200, category: 'Hair Spa' },
      { id: 'sp-dand', name: 'Dandruff Rebalancing Treatment', price: 2500, category: 'Hair Spa' },
      { id: 'hc-royal', name: 'Royal Signature Haircut', price: 1500, category: 'Haircut' }
    ],
    amenities: ['Valet Parking', 'Organic Tea Service', 'Steam & Sauna access'],
    reviews: [
      { author: 'Karan J.', text: 'Meera\'s scalp therapy is so relaxing. I almost fell asleep! The organic tea they serve is delicious.', rating: 5, date: '2026-06-19' },
      { author: 'Pooja Bhat', text: 'Excellent precision haircut by Aarav. Extremely clean salon and very professional.', rating: 5, date: '2026-06-25' }
    ]
  }
]
