import { db } from '../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';

const sampleCertificates = [
  {
    name: "Goutham Sankar",
    eventName: "ATHLOS Athletic Meet 2025",
    certificateId: "ATHLOS25-GS-001",
    universityCode: "PRP24CS068",
    department: "Computer Science",
    year: "2024"
  },
];

async function addSampleData() {
  try {
    console.log('Adding sample certificates to Firestore...');
    
    for (const certificate of sampleCertificates) {
      const docRef = await addDoc(collection(db, 'certificates'), certificate);
      console.log(`Added certificate with ID: ${docRef.id}`);
    }
    
    console.log('Sample data added successfully!');
    console.log('\nTest university codes:');
    console.log('- PRP24CS068 (Goutham Sankar)');
    
  } catch (error) {
    console.error('Error adding sample data:', error);
  }
}

// Run the script
addSampleData(); 