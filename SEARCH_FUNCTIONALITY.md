# Certificate Search Functionality

## Overview

The ATHLOS certificate portal allows users to search for their certificates using their university code (search_id). The system searches the Firebase database for certificates matching the provided university code and displays them with download functionality.

## How It Works

### 1. Search Process

1. **User Input**: User enters their university code (e.g., "PRP24CS068") in the search field
2. **API Call**: The frontend calls `/api/certificates?universityCode={code}`
3. **Database Query**: The API searches the `certificate_list` collection in Firebase Firestore for documents where `search_id` matches the university code
4. **Response**: Returns all matching certificates with their details and download links

### 2. Certificate Data Structure

Each certificate in the database contains:

```typescript
{
  id: string;                    // Firestore document ID
  name: string;                  // Event name
  eventName: string;             // Event name (alias)
  certificateId: string;         // Certificate template ID
  universityCode: string;        // University code (search_id)
  organizerName?: string;        // Organizer name
  department?: string;           // Department
  year?: string;                // Year
  // Download link fields
  download_storage_url?: string; // Firebase Storage URL
  download_storage_path?: string; // Storage path
  download_file_name?: string;   // File name
  download_file_size?: number;   // File size in bytes
  download_file_format?: string; // File format (PNG)
  download_generated_at?: any;   // Generation timestamp
  download_count?: number;       // Download count
  download_links?: {             // Various download link formats
    direct_url?: string;
    search_url?: string;
    token_url?: string;
    api_url?: string;
    unique_token?: string;
  };
  certificate_metadata?: {       // Certificate metadata
    event_name?: string;
    organizer_name?: string;
    search_id?: string;
    template_id?: string;
    generated_timestamp?: number;
    bulk_upload?: boolean;
  };
}
```

### 3. Download Functionality

#### High-Quality Certificates (Recommended)
- **Source**: Uses `download_storage_url` from Firebase Storage
- **Format**: PNG files generated from certificate templates
- **Quality**: High-resolution, professionally designed certificates
- **Status**: Shows green indicator "High-quality certificate available"

#### Generated Certificates (Fallback)
- **Source**: Generated on-demand using simple HTML templates
- **Format**: PDF files with basic styling
- **Quality**: Basic certificates for certificates without stored URLs
- **Status**: Shows yellow indicator "Generated on-demand"

### 4. Search Flow

```
User enters university code
         ↓
    API call to /api/certificates
         ↓
    Query Firebase Firestore
    where search_id == university_code
         ↓
    Return matching certificates
         ↓
    Display certificates with download options
         ↓
    User clicks download
         ↓
    Download from Firebase Storage URL
    or generate simple certificate
```

## API Endpoints

### GET /api/certificates

**Parameters:**
- `universityCode` (string): University code to search for
- `id` (string): Certificate ID (alternative search method)

**Response:**
```json
{
  "certificates": [
    {
      "id": "certificate_doc_id",
      "name": "Annual Tech Conference 2024",
      "eventName": "Annual Tech Conference 2024",
      "certificateId": "tech_conf_2024",
      "universityCode": "PRP24CS068",
      "organizerName": "Tech Institute",
      "download_storage_url": "https://firebasestorage.googleapis.com/...",
      "download_file_name": "certificate_PRP24CS068.png",
      "download_file_size": 245760,
      // ... other fields
    }
  ]
}
```

## Error Handling

### Common Error Scenarios

1. **No Certificates Found**
   - Status: 404
   - Message: "No certificates found for this university code."
   - Action: Shows contact support link

2. **Invalid University Code**
   - Status: 400
   - Message: "University code or certificate ID is required"
   - Action: Prompts user to enter valid code

3. **Rate Limiting**
   - Status: 429
   - Message: "Too many requests. Please try again later."
   - Action: Shows retry after countdown

4. **Server Error**
   - Status: 500
   - Message: "Internal server error"
   - Action: Prompts user to try again

## Testing

### Development Testing

In development mode, a "Test Search" button is available that:
1. Sets university code to "TEST001"
2. Triggers search automatically
3. Helps verify search functionality

### Manual Testing

1. Enter a valid university code (e.g., "PRP24CS068")
2. Click search or press Enter
3. Verify certificates are displayed
4. Test download functionality
5. Test bulk download (if multiple certificates)

## Database Requirements

### Firebase Firestore Collection: `certificate_list`

Required fields for search:
- `search_id` (string): University code for searching
- `event_name` (string): Event name
- `certificate_id` (string): Certificate template ID
- `organizer_name` (string): Organizer name

Optional fields for enhanced functionality:
- `download_storage_url` (string): Firebase Storage URL
- `download_file_name` (string): File name
- `download_file_size` (number): File size in bytes
- `download_links` (object): Various download link formats

## Security Considerations

1. **Rate Limiting**: API calls are rate-limited to prevent abuse
2. **Input Validation**: University codes are validated before database queries
3. **Error Handling**: Sensitive information is not exposed in error messages
4. **CORS**: Firebase Storage URLs handle CORS properly for downloads

## Performance Optimizations

1. **Client-side Caching**: Search results are cached in component state
2. **Efficient Queries**: Uses Firestore indexes on `search_id` field
3. **Lazy Loading**: Certificates are loaded only when needed
4. **Bulk Operations**: Multiple certificates can be downloaded as ZIP

## Troubleshooting

### Common Issues

1. **No certificates found**
   - Verify university code is correct
   - Check if certificates exist in database
   - Ensure `search_id` field matches university code

2. **Download fails**
   - Check if `download_storage_url` exists
   - Verify Firebase Storage permissions
   - Check network connectivity

3. **Slow search**
   - Check Firestore query performance
   - Verify database indexes
   - Monitor API response times

### Debug Information

The system logs detailed information to help troubleshoot:
- Search queries and results
- Certificate details and download URLs
- API response status and errors
- Download success/failure events 