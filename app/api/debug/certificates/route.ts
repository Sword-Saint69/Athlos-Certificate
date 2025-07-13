import { NextRequest, NextResponse } from 'next/server';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function GET(request: NextRequest) {
  try {
    console.log('Debug: Fetching all certificates from database...');
    
    // Get all certificates from the database
    const certificatesRef = collection(db, 'certificate_list');
    const querySnapshot = await getDocs(certificatesRef);
    
    const certificates = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        search_id: data.search_id || 'N/A',
        event_name: data.event_name || 'N/A',
        organizer_name: data.organizer_name || 'N/A',
        certificate_id: data.certificate_id || 'N/A',
        download_storage_url: data.download_storage_url || null,
        download_file_name: data.download_file_name || 'N/A',
        download_file_size: data.download_file_size || 'N/A',
        has_download_url: !!data.download_storage_url,
        // Include all other fields for debugging
        ...data
      };
    });
    
    console.log(`Debug: Found ${certificates.length} certificates in database`);
    
    // Log some sample certificates for debugging
    if (certificates.length > 0) {
      console.log('Debug: Sample certificates:');
      certificates.slice(0, 3).forEach((cert, index) => {
        console.log(`${index + 1}. ID: ${cert.id}, Search ID: ${cert.search_id}, Event: ${cert.event_name}`);
      });
    }
    
    return NextResponse.json({ 
      certificates,
      total: certificates.length,
      message: `Found ${certificates.length} certificates in database`
    });
    
  } catch (error) {
    console.error('Debug API Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch certificates from database',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 