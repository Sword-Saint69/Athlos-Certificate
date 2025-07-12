import { NextRequest, NextResponse } from 'next/server';
import { CertificateService } from '@/lib/certificateService';
import { rateLimiter } from '@/lib/rateLimiter';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const clientIP = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
    const rateLimit = rateLimiter.checkLimit(clientIP)
    
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { 
          error: 'Too many requests. Please try again later.',
          retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000)
        },
        { 
          status: 429,
          headers: {
            'Retry-After': Math.ceil((rateLimit.resetTime - Date.now()) / 1000).toString()
          }
        }
      );
    }

    const { searchParams } = new URL(request.url);
    const universityCode = searchParams.get('universityCode');
    const id = searchParams.get('id');

    if (!universityCode && !id) {
      return NextResponse.json(
        { error: 'University code or certificate ID is required' },
        { status: 400 }
      );
    }

    let certificates;

    if (universityCode) {
      certificates = await CertificateService.getCertificatesByUniversityCode(universityCode);
    } else if (id) {
      // For certificate ID, we need to search in the collection
      const certificatesRef = collection(db, 'certificate_list');
      const q = query(certificatesRef, where('certificate_id', '==', id));
      const querySnapshot = await getDocs(q);
      
      certificates = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.event_name || 'Unknown Event',
          eventName: data.event_name || 'Unknown Event',
          certificateId: data.certificate_id || 'Unknown',
          universityCode: data.search_id || 'Unknown',
          phone: data.phone,
          department: data.department,
          year: data.year,
          pdfUrl: data.pdfUrl,
          organizerName: data.organizer_name,
          ...data
        };
      });
    }

    if (!certificates || certificates.length === 0) {
      return NextResponse.json(
        { error: 'No certificates found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ certificates });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { universityCode } = body;

    if (!universityCode) {
      return NextResponse.json(
        { error: 'University code is required' },
        { status: 400 }
      );
    }

    const certificates = await CertificateService.getCertificatesByUniversityCode(universityCode);

    if (!certificates || certificates.length === 0) {
      return NextResponse.json(
        { error: 'No certificates found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ certificates });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 