# 📁 ATHLOS Certificate Upload Guide

## 🚀 How to Handle Bulk Upload

### **Step 1: Prepare Your Data**

1. **Update Certificate Data** in `scripts/bulk-upload-pdfs.ts`:
   ```typescript
   const certificateData: CertificateInfo[] = [
     {
       universityCode: "PRP24CS068",
       name: "Goutham Sankar",
       eventName: "ATHLOS Athletic Meet 2025",
       department: "Computer Science",
       year: "2024",
       position: "1st Place",
       category: "Men's"
     },
     // Add all your certificates here...
   ];
   ```

2. **Prepare PDF Files** in the `pdfs/` directory:
   ```
   pdfs/
   ├── PRP24CS068-ATHLOS-Athletic-Meet-2025.pdf
   ├── PRP24CS068-ATHLOS-Football-Tournament-2025.pdf
   ├── PRP24CS069-ATHLOS-Football-Tournament-2025.pdf
   └── ... (all your PDF files)
   ```

### **Step 2: Naming Convention**

**PDF File Names Must Follow This Pattern:**
```
{UniversityCode}-{EventSlug}.pdf
```

**Examples:**
- `PRP24CS068-ATHLOS-Athletic-Meet-2025.pdf`
- `PRP24CS068-ATHLOS-Football-Tournament-2025.pdf`
- `PRP24CS069-ATHLOS-Table-Tennis-Tournament-2025.pdf`

**Event Slug Rules:**
- Replace spaces with hyphens
- Remove special characters
- Keep it consistent with your certificate data

### **Step 3: Run the Upload**

```bash
# Install dependencies if needed
npm install

# Run the bulk upload script
npx tsx scripts/bulk-upload-pdfs.ts
```

### **Step 4: Monitor the Process**

The script will show:
- ✅ Progress for each certificate
- 📤 Upload status
- 💾 Database updates
- 📊 Final summary

### **Step 5: Verify Upload**

1. **Check Firebase Console:**
   - Go to Firebase Storage → `certificates/` folder
   - Verify PDFs are uploaded

2. **Check Firestore Database:**
   - Go to Firestore → `certificates` collection
   - Verify certificate data is added

3. **Test the Portal:**
   - Search for a university code
   - Verify certificates appear
   - Test download functionality

## 🔧 Troubleshooting

### **Common Issues:**

1. **PDF Not Found:**
   ```
   ⚠️  PDF not found: PRP24CS068-ATHLOS-Athletic-Meet-2025.pdf - Skipping...
   ```
   **Solution:** Check file name matches exactly

2. **Firebase Permission Error:**
   ```
   ❌ Failed to upload: Permission denied
   ```
   **Solution:** Check Firebase configuration and rules

3. **Network Error:**
   ```
   ❌ Failed to process: Network timeout
   ```
   **Solution:** Check internet connection and retry

### **Error Recovery:**

```bash
# If upload fails, you can run again - it will skip existing files
npx tsx scripts/bulk-upload-pdfs.ts
```

## 📋 Data Structure

### **Certificate Info Fields:**
```typescript
interface CertificateInfo {
  universityCode: string;    // Required: Student's university code
  name: string;              // Required: Student's full name
  eventName: string;         // Required: Event name
  department: string;        // Required: Student's department
  year: string;             // Required: Academic year
  position?: string;        // Optional: 1st, 2nd, 3rd place
  category?: string;        // Optional: Men's, Women's, Mixed
}
```

### **Firestore Document Structure:**
```json
{
  "name": "Goutham Sankar",
  "eventName": "ATHLOS Athletic Meet 2025",
  "certificateId": "ATHLOS25-068-ATHLOS-Athletic-Meet-2025",
  "universityCode": "PRP24CS068",
  "department": "Computer Science",
  "year": "2024",
  "pdfUrl": "https://firebasestorage.googleapis.com/...",
  "position": "1st Place",
  "category": "Men's",
  "uploadedAt": "2025-01-15T10:30:00.000Z",
  "status": "active"
}
```

## 🎯 Best Practices

1. **Backup Your Data:**
   - Keep original PDFs safe
   - Document your certificate data

2. **Test First:**
   - Upload 2-3 certificates first
   - Verify everything works
   - Then do bulk upload

3. **Organize Files:**
   - Use consistent naming
   - Keep PDFs in organized folders
   - Document your naming convention

4. **Monitor Progress:**
   - Watch console output
   - Check Firebase console
   - Verify in portal

## 🆘 Support

If you encounter issues:

1. **Check Console Output** for specific error messages
2. **Verify Firebase Configuration** in `lib/firebase.ts`
3. **Check File Names** match exactly
4. **Contact Support** via WhatsApp: +91 9074409995

## 📊 Upload Statistics

After upload, you'll see:
```
🎉 Bulk upload completed!
📊 Summary:
   ✅ Successfully uploaded: 15
   ❌ Errors: 0
   ⚠️  Skipped (missing PDFs): 2
   📁 Total processed: 17
```

This helps you track what was uploaded successfully and what needs attention. 