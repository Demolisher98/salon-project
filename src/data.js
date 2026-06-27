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
