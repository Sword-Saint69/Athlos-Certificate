import JSZip from 'jszip'
import { CertificateData } from './certificateService'
import { CertificateService } from './certificateService'

export class BulkDownloadService {
  /**
   * Download all certificates for a student as a ZIP file
   */
  static async downloadAllCertificates(certificates: CertificateData[], studentName: string): Promise<void> {
    try {
      const zip = new JSZip()
      
      // Create a folder for the student
      const studentFolder = zip.folder(studentName.replace(/\s+/g, '_'))
      
      if (!studentFolder) {
        throw new Error('Failed to create ZIP folder')
      }
      
      // Download and add each certificate to the ZIP
      const downloadPromises = certificates.map(async (certificate, index) => {
        try {
          const pdfUrl = await CertificateService.getCertificatePdfUrl(certificate.certificateId)
          
          if (!pdfUrl) {
            console.warn(`No PDF found for certificate: ${certificate.certificateId}`)
            return null
          }
          
          // Download the PDF
          const response = await fetch(pdfUrl)
          const pdfBlob = await response.blob()
          
          // Create filename
          const eventSlug = certificate.eventName.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '')
          const filename = `${certificate.certificateId}_${eventSlug}.pdf`
          
          // Add to ZIP
          studentFolder.file(filename, pdfBlob)
          
          console.log(`✅ Added to ZIP: ${filename}`)
          return filename
          
        } catch (error) {
          console.error(`❌ Failed to add certificate ${certificate.certificateId}:`, error)
          return null
        }
      })
      
      // Wait for all downloads to complete
      const results = await Promise.all(downloadPromises)
      const successfulDownloads = results.filter(Boolean)
      
      if (successfulDownloads.length === 0) {
        throw new Error('No certificates could be downloaded')
      }
      
      // Generate and download the ZIP file
      const zipBlob = await zip.generateAsync({ type: 'blob' })
      
      // Create download link
      const downloadUrl = window.URL.createObjectURL(zipBlob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = `${studentName}_All_Certificates.zip`
      
      // Trigger download
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      // Clean up
      window.URL.revokeObjectURL(downloadUrl)
      
      console.log(`🎉 Bulk download completed: ${successfulDownloads.length} certificates`)
      
    } catch (error) {
      console.error('❌ Bulk download failed:', error)
      throw new Error('Failed to download certificates')
    }
  }
  
  /**
   * Get download progress for bulk download
   */
  static async getDownloadProgress(certificates: CertificateData[]): Promise<number> {
    // This would track progress in a real implementation
    return 0
  }
} 