import { NextRequest, NextResponse } from 'next/server';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('Adding test certificate:', body);
    
    // Validate required fields
    if (!body.search_id || !body.event_name || !body.organizer_name) {
      return NextResponse.json(
        { error: 'Missing required fields: search_id, event_name, organizer_name' },
        { status: 400 }
      );
    }
    
    // Add the certificate to Firestore
    const certificatesRef = collection(db, 'certificate_list');
    const docRef = await addDoc(certificatesRef, {
      ...body,
      created_at: new Date().toISOString(),
      test_data: true
    });
    
    console.log('Test certificate added with ID:', docRef.id);
    
    return NextResponse.json({ 
      id: docRef.id,
      message: 'Test certificate added successfully',
      data: body
    });
    
  } catch (error) {
    console.error('Error adding test certificate:', error);
    return NextResponse.json(
      { error: 'Failed to add test certificate' },
      { status: 500 }
    );
  }
} 