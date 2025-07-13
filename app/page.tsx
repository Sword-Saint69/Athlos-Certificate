"use client" // This component needs to be a Client Component to use useState and onClick handlers

import { useState, useCallback, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { GraduationCap, Search, Loader2, Download, Archive } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { CertificateData } from "@/lib/certificateService"
import { LoadingSpinner } from "@/components/loading-spinner"
import { CertificateCard } from "@/components/certificate-card"
import { generateSearchSuggestions, trackSearch } from "@/lib/searchUtils"
import { analytics } from "@/lib/analytics"
import { BulkDownloadService } from "@/lib/bulkDownload"

export default function Component() {
  const [universityCode, setUniversityCode] = useState("")
  const [certificates, setCertificates] = useState<CertificateData[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const [isBulkDownloading, setIsBulkDownloading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)

    const handleSearch = useCallback(async () => {
    if (!universityCode) {
      setError("Please enter a university code.")
      setCertificates([])
      return
    }

    setIsLoading(true)
    setError(null)
    setCertificates([]) // Clear previous data

    try {
      console.log(`Searching for certificates with university code: ${universityCode}`)
      
      // Call Firebase API
      const response = await fetch(`/api/certificates?universityCode=${encodeURIComponent(universityCode)}`)
      const data = await response.json()

      console.log('API Response:', data)

      if (!response.ok) {
        if (response.status === 404) {
          setError("No certificates found for this university code.")
        } else {
          setError("Failed to fetch certificates. Please try again.")
        }
        return
      }

      setCertificates(data.certificates)
      
      // Log certificate details for debugging
      console.log(`Found ${data.certificates.length} certificates:`)
      data.certificates.forEach((cert: any, index: number) => {
        console.log(`${index + 1}. ${cert.name} - ${cert.universityCode}`)
        console.log(`   Has download URL: ${!!cert.download_storage_url}`)
        console.log(`   File name: ${cert.download_file_name || 'N/A'}`)
        console.log(`   File size: ${cert.download_file_size || 'N/A'} bytes`)
      })
      
      // Track search analytics
      analytics.trackSearch(universityCode, data.certificates.length, data.certificates.length > 0)
      trackSearch(universityCode, data.certificates.length)
      
    } catch (error) {
      console.error('Error fetching certificates:', error)
      setError("Failed to fetch certificates. Please try again.")
      analytics.trackError('Search failed', 'certificate_search')
    } finally {
      setIsLoading(false)
    }
  }, [universityCode])

  // Handle search suggestions
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setUniversityCode(value)
    
    if (value.length > 0) {
      const suggestions = generateSearchSuggestions(value)
      setSearchSuggestions(suggestions)
      setShowSuggestions(suggestions.length > 0)
    } else {
      setShowSuggestions(false)
    }
  }

  // Handle bulk download
  const handleBulkDownload = async () => {
    if (certificates.length === 0) return
    
    setIsBulkDownloading(true)
    try {
      await BulkDownloadService.downloadAllCertificates(
        certificates, 
        certificates[0].name
      )
      
      // Track bulk download analytics
      certificates.forEach(cert => {
        analytics.trackDownload(cert.certificateId, cert.universityCode, cert.eventName)
      })
      
    } catch (error) {
      console.error('Bulk download failed:', error)
      setError('Failed to download all certificates. Please try again.')
    } finally {
      setIsBulkDownloading(false)
    }
  }

  // Track page view on mount
  useEffect(() => {
    analytics.trackPageView('certificate_portal')
  }, [])

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-sans">
      <header className="flex flex-col items-center justify-center py-16 md:py-24 px-4 text-center relative">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        <h1 className="text-5xl md:text-7xl font-display font-black tracking-tight mb-3 text-foreground">ATHLOS 2025</h1>
        <p className="text-xl md:text-2xl font-slab font-medium text-muted-foreground mb-2">COLLEGE OF ENGINEERING AND MANAGEMENT PUNNAPRA</p>
        <p className="text-lg md:text-xl font-slab text-muted-foreground/80">Certificate Portal</p>
      </header>

      <main className="flex-grow flex flex-col items-center px-4 py-8 md:py-12 space-y-8 max-w-7xl mx-auto w-full">
        <Card className="w-full max-w-md p-4 shadow-lg border-border transition-all duration-300 hover:shadow-xl">
          <CardContent className="flex items-center space-x-3 p-0">
            <GraduationCap className="h-5 w-5 text-muted-foreground" />
            <div className="relative flex-grow">
              <Input
                type="text"
                placeholder="Enter your university code Eg:PRP24CS068"
                className="bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-foreground placeholder:text-muted-foreground text-base"
                value={universityCode}
                onChange={handleInputChange}
                aria-label="University code"
              />
              
              {/* Search suggestions */}
              {showSuggestions && searchSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-card border border-border rounded-lg shadow-lg z-50 mt-1">
                  {searchSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      className="w-full text-left px-3 py-2 hover:bg-accent text-sm"
                      onClick={() => {
                        setUniversityCode(suggestion)
                        setShowSuggestions(false)
                      }}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <Button
              onClick={handleSearch}
              disabled={isLoading}
              className="bg-primary text-primary-foreground hover:bg-primary/90 transition-colors duration-200"
              aria-label="Search certificate"
            >
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
              <span className="sr-only">Search</span>
            </Button>
          </CardContent>
        </Card>

        {/* Test button for development */}
        {process.env.NODE_ENV === 'development' && (
          <div className="text-center mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setUniversityCode('TEST001')
                handleSearch()
              }}
              className="text-xs"
            >
              Test Search (Development)
            </Button>
          </div>
        )}

                {error && (
          <div className="text-center max-w-md mt-4 space-y-4">
            <p className="text-destructive">{error}</p>
            <div className="flex flex-col items-center space-y-3">
              <p className="text-muted-foreground text-sm">Missing Certificates?</p>
              <a
                href="https://wa.me/919074409995?text=Hello! I cannot find my certificate in the ATHLOS portal. My university code is: [Please enter your university code here]"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 font-medium"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                </svg>
                Contact Support
              </a>
            </div>
          </div>
        )}

        {certificates.length > 0 && (
          <div className="w-full max-w-4xl space-y-6">
            <div className="text-center">
              <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-2">
                Certificates Found ({certificates.length})
              </h2>
              <p className="text-muted-foreground font-slab">
                {certificates[0].name} - {certificates[0].universityCode}
              </p>
              
              {/* Certificate status summary */}
              <div className="mt-4 flex justify-center">
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-green-600 dark:text-green-400">
                      {certificates.filter(cert => cert.download_storage_url).length} High-quality certificates
                    </span>
                  </div>
                  {certificates.filter(cert => !cert.download_storage_url).length > 0 && (
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <span className="text-yellow-600 dark:text-yellow-400">
                        {certificates.filter(cert => !cert.download_storage_url).length} Generated on-demand
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Bulk download button */}
              {certificates.length > 1 && (
                <div className="mt-4">
                  <Button 
                    onClick={handleBulkDownload}
                    disabled={isBulkDownloading}
                    className="gap-2 bg-secondary hover:bg-secondary/80"
                    size="lg"
                  >
                    {isBulkDownloading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Archive className="h-5 w-5" />
                    )}
                    {isBulkDownloading ? 'Creating ZIP...' : `Download All (${certificates.length})`}
                  </Button>
                </div>
              )}
            </div>
            
            <div className="grid gap-6 md:grid-cols-2">
              {certificates.map((certificate, index) => (
                <CertificateCard
                  key={certificate.id}
                  certificate={certificate}
                  index={index}
                />
              ))}
            </div>
          </div>
        )}
      </main>

      <footer className="bg-card py-12 px-8 border-t border-border text-card-foreground">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 text-sm font-slab">
          <div className="space-y-2">
            <h3 className="font-display font-bold text-lg mb-2">About ATHLOS</h3>
            <p className="text-muted-foreground">Annual Athletic Meet at College of Engineering and Management Punnapra.</p>
          </div>
          <div className="space-y-2">
            <h3 className="font-display font-bold text-lg mb-2">Events</h3>
            <ul className="space-y-1 text-muted-foreground">
              <li>Football Tournament</li>
              <li>Cricket Tournament</li>
              <li>Table Tennis Tournament</li>
              <li>Athletics Meet</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h3 className="font-display font-bold text-lg mb-2">Support</h3>
            <ul className="space-y-1 text-muted-foreground">
              <li>
                <a 
                  href="https://wa.me/919074409995?text=Hello! I need help with ATHLOS certificate portal."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors duration-200"
                >
                  Contact Us
                </a>
              </li>
              <li>
                <a 
                  href="https://wa.me/919074409995?text=Hello! I have a question about ATHLOS certificates."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors duration-200"
                >
                  FAQ
                </a>
              </li>
              <li>
                <a 
                  href="https://wa.me/919074409995?text=Hello! I need help desk support for ATHLOS."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors duration-200"
                >
                  Help Desk
                </a>
              </li>
              <li>
                <a 
                  href="https://wa.me/919074409995?text=Hello! I need technical support for ATHLOS certificate portal."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors duration-200"
                >
                  Technical Support
                </a>
              </li>
              <li>
                <a 
                  href="https://wa.me/919074409995?text=Hello! I cannot find my certificate in the ATHLOS portal. My university code is: [Please enter your university code here]"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors duration-200 font-medium"
                >
                  Missing Certificates?
                </a>
              </li>
            </ul>
          </div>
          <div className="space-y-2">
            <h3 className="font-display font-bold text-lg mb-2">Contact</h3>
            <address className="not-italic space-y-1 text-muted-foreground">
              <p>College of Engineering</p>
              <p>Punnapra, Alappuzha</p>
              <p>Kerala, India</p>
              <p>
                website:{" "}
                <a
                  href="http://www.cempunnapra.org"
                  className="hover:underline text-primary transition-colors duration-200"
                >
                  www.cempunnapra.org
                </a>
              </p>
              <p>
                Email:{" "}
                <a
                  href="mailto:athloscempunnapra@gmail.com"
                  className="hover:underline text-primary transition-colors duration-200"
                >
                  athloscempunnapra@gmail.com
                </a>
              </p>
            </address>
          </div>
        </div>
        <div className="text-center text-muted-foreground/60 text-xs mt-12">© 2025 ATHLOS 25. All rights reserved.</div>
      </footer>
    </div>
  )
}
