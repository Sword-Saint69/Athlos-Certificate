import { db, storage } from './firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { ref, getDownloadURL } from 'firebase/storage';

export interface CertificateData {
  id: string;
  name: string;
  eventName: string;
  certificateId: string;
  universityCode: string;
  phone?: string;
  department?: string;
  year?: string;
  pdfUrl?: string;
  organizerName?: string;
  search_id?: string;
  certificate_id?: string;
  event_name?: string;
  organizer_name?: string;
  // Download link fields from Firebase database
  download_storage_url?: string;
  download_storage_path?: string;
  download_file_name?: string;
  download_file_size?: number;
  download_file_format?: string;
  download_generated_at?: any;
  download_count?: number;
  download_links?: {
    direct_url?: string;
    search_url?: string;
    token_url?: string;
    api_url?: string;
    generated_at?: any;
    unique_token?: string;
  };
  certificate_metadata?: {
    event_name?: string;
    organizer_name?: string;
    search_id?: string;
    template_id?: string;
    generated_timestamp?: number;
    bulk_upload?: boolean;
  };
  [key: string]: any; // Allow for additional dynamic fields
}

export class CertificateService {
  private static readonly COLLECTION_NAME = 'certificate_list';

  /**
   * Get all certificates by search ID (university code)
   */
  static async getCertificatesByUniversityCode(searchId: string): Promise<CertificateData[]> {
    try {
      const certificatesRef = collection(db, this.COLLECTION_NAME);
      const q = query(certificatesRef, where('search_id', '==', searchId));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.event_name || 'Unknown Event',
          eventName: data.event_name || 'Unknown Event',
          certificateId: data.certificate_id || 'Unknown',
          universityCode: data.search_id || searchId,
          phone: data.phone,
          department: data.department,
          year: data.year,
          pdfUrl: data.pdfUrl,
          // Map additional fields from your admin panel
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
          ...data // Include all other fields
        };
      }) as CertificateData[];
    } catch (error) {
      console.error('Error fetching certificates:', error);
      throw new Error('Failed to fetch certificates');
    }
  }

  /**
   * Get certificate by ID
   */
  static async getCertificateById(id: string): Promise<CertificateData | null> {
    try {
      const docRef = doc(db, this.COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as CertificateData;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching certificate:', error);
      throw new Error('Failed to fetch certificate');
    }
  }

  /**
   * Get all certificates (for admin purposes)
   */
  static async getAllCertificates(): Promise<CertificateData[]> {
    try {
      const certificatesRef = collection(db, this.COLLECTION_NAME);
      const querySnapshot = await getDocs(certificatesRef);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as CertificateData[];
    } catch (error) {
      console.error('Error fetching certificates:', error);
      throw new Error('Failed to fetch certificates');
    }
  }

  /**
   * Download certificate using stored Firebase Storage URL
   */
  static async downloadCertificate(certificate: CertificateData): Promise<void> {
    try {
      // Check if we have a stored download URL
      if (certificate.download_storage_url) {
        // Use the stored Firebase Storage URL
        await this.downloadFromStorageUrl(certificate.download_storage_url, certificate.download_file_name || `${certificate.name}_${certificate.eventName}.png`);
      } else {
        // Fallback to generating a simple certificate if no stored URL
        console.warn('No stored download URL found, generating simple certificate');
        await this.generateSimpleCertificate(certificate.certificateId, `${certificate.name}_${certificate.eventName}.pdf`);
      }
    } catch (error) {
      console.error('Error downloading certificate:', error);
      throw new Error('Failed to download certificate');
    }
  }

  /**
   * Download certificate from Firebase Storage URL
   */
  static async downloadFromStorageUrl(storageUrl: string, fileName: string): Promise<void> {
    try {
      // Fetch the file from Firebase Storage
      const response = await fetch(storageUrl);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch certificate: ${response.statusText}`);
      }
      
      // Get the blob
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      console.log(`Certificate downloaded successfully: ${fileName}`);
    } catch (error) {
      console.error('Error downloading from storage URL:', error);
      throw new Error('Failed to download certificate from storage');
    }
  }

  /**
   * Get PDF download URL for a certificate (legacy method)
   */
  static async getCertificatePdfUrl(certificateId: string): Promise<string | null> {
    try {
      // Skip Firebase Storage for now due to CORS issues
      // We'll generate certificates dynamically instead
      return null;
    } catch (error) {
      console.error('Error getting PDF URL:', error);
      return null;
    }
  }

  /**
   * Download certificate PDF (legacy method - now uses downloadCertificate)
   */
  static async downloadCertificatePdf(certificateId: string, fileName: string): Promise<void> {
    try {
      // Get certificate data first
      const certificate = await this.getCertificateById(certificateId);
      if (!certificate) {
        throw new Error('Certificate not found');
      }
      
      // Use the new download method
      await this.downloadCertificate(certificate);
    } catch (error) {
      console.error('Error downloading certificate:', error);
      throw new Error('Failed to generate certificate');
    }
  }

  /**
   * Generate a simple certificate HTML file
   */
  static async generateSimpleCertificate(certificateId: string, fileName: string): Promise<void> {
    try {
      let certificate;
      
      // First try to get certificate by ID
      const response = await fetch(`/api/certificates?id=${certificateId}`);
      const data = await response.json();
      
      if (data.certificates && data.certificates.length > 0) {
        certificate = data.certificates[0];
      } else {
        // If not found by ID, try searching by university code
        const searchResponse = await fetch(`/api/certificates?universityCode=${certificateId}`);
        const searchData = await searchResponse.json();
        
        if (!searchData.certificates || searchData.certificates.length === 0) {
          throw new Error('Certificate not found');
        }
        
        // Use the first certificate found
        certificate = searchData.certificates[0];
      }
      
      // Create a simple HTML certificate
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Certificate - ${certificate.name}</title>
          <style>
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
              margin: 0; 
              padding: 20px; 
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .certificate {
              background: white;
              padding: 40px;
              border-radius: 15px;
              box-shadow: 0 20px 40px rgba(0,0,0,0.1);
              text-align: center;
              max-width: 800px;
              width: 100%;
              border: 3px solid #667eea;
            }
            .title {
              font-size: 2.5em;
              color: #333;
              margin-bottom: 20px;
              font-weight: bold;
              text-transform: uppercase;
            }
            .subtitle {
              font-size: 1.2em;
              color: #666;
              margin-bottom: 30px;
            }
            .name {
              font-size: 2.2em;
              color: #667eea;
              margin: 30px 0;
              font-weight: bold;
              text-transform: uppercase;
            }
            .event {
              font-size: 1.5em;
              color: #333;
              margin-bottom: 20px;
              font-weight: 600;
            }
            .details {
              font-size: 1.1em;
              color: #666;
              margin: 20px 0;
              line-height: 1.6;
            }
            .footer {
              margin-top: 40px;
              font-size: 0.9em;
              color: #999;
              border-top: 1px solid #eee;
              padding-top: 20px;
            }
            .certificate-id {
              background: #f8f9fa;
              padding: 10px;
              border-radius: 5px;
              font-family: monospace;
              margin: 10px 0;
            }
          </style>
        </head>
        <body>
          <div class="certificate">
            <div class="title">Certificate of Participation</div>
            <div class="subtitle">This is to certify that</div>
            <div class="name">${certificate.name}</div>
            <div class="event">has successfully participated in</div>
            <div class="event">${certificate.eventName}</div>
            <div class="details">
              <div class="certificate-id">
                <strong>Certificate ID:</strong> ${certificate.certificateId}
              </div>
              <div class="certificate-id">
                <strong>University Code:</strong> ${certificate.universityCode}
              </div>
              ${certificate.organizerName ? `
                <div class="certificate-id">
                  <strong>Organizer:</strong> ${certificate.organizerName}
                </div>
              ` : ''}
              ${certificate.department ? `
                <div class="certificate-id">
                  <strong>Department:</strong> ${certificate.department}
                </div>
              ` : ''}
            </div>
            <div class="footer">
              <p>Generated on ${new Date().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</p>
              <p>ATHLOS 2025 - College of Engineering and Management Punnapra</p>
            </div>
          </div>
        </body>
        </html>
      `;

      // Create and download the HTML file
      const blob = new Blob([html], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName.replace('.pdf', '.html');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Error generating certificate:', error);
      throw new Error('Failed to generate certificate');
    }
  }


} 