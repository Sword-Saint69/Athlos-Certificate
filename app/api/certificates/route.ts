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

    console.log('API Debug: Request parameters:', { universityCode, id });

    if (!universityCode && !id) {
      console.log('API Debug: No university code or ID provided');
      return NextResponse.json(
        { error: 'University code or certificate ID is required' },
        { status: 400 }
      );
    }

    let certificates;

    if (universityCode) {
      // Search by university code (search_id)
      console.log(`API Debug: Searching for certificates with university code: "${universityCode}"`);
      
      // First, let's check what certificates exist in the database
      const allCertificatesRef = collection(db, 'certificate_list');
      const allCertificatesSnapshot = await getDocs(allCertificatesRef);
      const allCertificates = allCertificatesSnapshot.docs.map(doc => ({
        id: doc.id,
        search_id: doc.data().search_id,
        event_name: doc.data().event_name
      }));
      
      console.log(`API Debug: Total certificates in database: ${allCertificates.length}`);
      console.log('API Debug: Sample certificates:', allCertificates.slice(0, 5));
      
      // Now search for the specific university code
      certificates = await CertificateService.getCertificatesByUniversityCode(universityCode);
      
      console.log(`API Debug: Found ${certificates.length} certificates for university code "${universityCode}"`);
      
      if (certificates.length === 0) {
        // Let's check if there are any certificates with similar search_id values
        const similarCertificates = allCertificates.filter(cert => 
          cert.search_id && 
          (cert.search_id.toLowerCase().includes(universityCode.toLowerCase()) ||
           universityCode.toLowerCase().includes(cert.search_id.toLowerCase()))
        );
        
        console.log(`API Debug: Found ${similarCertificates.length} certificates with similar search_id values:`, similarCertificates);
      }
      
    } else if (id) {
      // For certificate ID, we need to search in the collection
      console.log(`API Debug: Searching for certificate with ID: "${id}"`);
      
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
          // Include download link fields
          download_storage_url: data.download_storage_url,
          download_storage_path: data.download_storage_path,
          download_file_name: data.download_file_name,
          download_file_size: data.download_file_size,
          download_file_format: data.download_file_format,
          download_generated_at: data.download_generated_at,
          download_count: data.download_count,
          download_links: data.download_links,
          certificate_metadata: data.certificate_metadata,
          ...data
        };
      });
      
      console.log(`API Debug: Found ${certificates.length} certificates for certificate ID "${id}"`);
    }

    if (!certificates || certificates.length === 0) {
      console.log('API Debug: No certificates found, returning 404');
      return NextResponse.json(
        { error: 'No certificates found for this university code.' },
        { status: 404 }
      );
    }

    // Log the certificates found for debugging
    console.log(`Found ${certificates.length} certificates for ${universityCode || id}:`);
    certificates.forEach((cert, index) => {
      console.log(`${index + 1}. ${cert.name} - ${cert.universityCode}`);
      console.log(`   Has download URL: ${!!cert.download_storage_url}`);
      console.log(`   File name: ${cert.download_file_name || 'N/A'}`);
      console.log(`   File size: ${cert.download_file_size || 'N/A'} bytes`);
    });

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