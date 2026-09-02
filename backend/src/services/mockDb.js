/**
 * KisanSetu AI In-Memory Fallback Database
 * Ensures full platform functionality even if a local MongoDB service is not active.
 */

const mockStore = {
  users: [
    {
      _id: 'usr_admin',
      name: 'Dr. V. K. Sharma (Ministry of Agriculture)',
      email: 'admin@kisansetu.in',
      phone: '9810011223',
      passwordHash: '$2a$10$YourHashedPasswordHere',
      role: 'ADMIN',
      address: { street: 'Krishi Bhawan', city: 'New Delhi', state: 'Delhi', pincode: '110001' },
    },
    {
      _id: 'usr_farmer1',
      name: 'Ramesh Kumar',
      email: 'farmer.ramesh@kisansetu.in',
      phone: '9876543210',
      passwordHash: '$2a$10$YourHashedPasswordHere',
      role: 'FARMER',
      address: { street: 'Kheri Village', city: 'Karnal', state: 'Haryana', pincode: '132001' },
    },
    {
      _id: 'usr_farmer2',
      name: 'Suresh Singh',
      email: 'farmer.suresh@kisansetu.in',
      phone: '9876543211',
      passwordHash: '$2a$10$YourHashedPasswordHere',
      role: 'FARMER',
      address: { street: 'Samalkha', city: 'Panipat', state: 'Haryana', pincode: '132103' },
    },
    {
      _id: 'usr_fpo1',
      name: 'Punjab Kisan Producer Co-op',
      email: 'fpo.punjab@kisansetu.in',
      phone: '9876543212',
      passwordHash: '$2a$10$YourHashedPasswordHere',
      role: 'FPO',
      address: { street: 'GT Road Hub', city: 'Ambala', state: 'Punjab', pincode: '134003' },
    },
    {
      _id: 'usr_buyer1',
      name: 'FreshMart Supermarkets Ltd',
      email: 'buyer.freshmart@kisansetu.in',
      phone: '9876543213',
      passwordHash: '$2a$10$YourHashedPasswordHere',
      role: 'BULK_BUYER',
      address: { street: 'Sector 62 DC', city: 'Noida', state: 'Uttar Pradesh', pincode: '201301' },
    },
    {
      _id: 'usr_consumer1',
      name: 'Anita Verma',
      email: 'consumer.anita@kisansetu.in',
      phone: '9876543214',
      passwordHash: '$2a$10$YourHashedPasswordHere',
      role: 'CONSUMER',
      address: { street: 'Flat 402, Green Acres', city: 'Delhi', state: 'Delhi', pincode: '110016' },
    },
    {
      _id: 'usr_logistics1',
      name: 'ColdChain Express Logistics',
      email: 'logistics.express@kisansetu.in',
      phone: '9876543215',
      passwordHash: '$2a$10$YourHashedPasswordHere',
      role: 'LOGISTICS',
      address: { street: 'Transport Nagar', city: 'Delhi', state: 'Delhi', pincode: '110042' },
    },
  ],
  farmerProfiles: {
    usr_farmer1: { farmSizeAcres: 8.5, trustScore: 94, qualityScore: 95, totalEarnings: 184000 },
    usr_farmer2: { farmSizeAcres: 6.0, trustScore: 88, qualityScore: 90, totalEarnings: 142000 },
  },
  systemConfig: {
    CONSUMER_MAX_PURCHASE_LIMIT_KG: 10,
  },
};

module.exports = mockStore;
