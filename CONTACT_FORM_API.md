# Contact Form API Documentation

## Overview
The contact form API allows collecting inquiries from your website visitors with automatic email notifications.

## Endpoint

### POST `/api/contact-form`

Accepts contact form submissions and sends email notifications to both the user and admin.

**Request Body:**
```json
{
  "name": "John Doe",
  "phone": "+1 (555) 123-4567",
  "email": "john@example.com",
  "subject": "Project Inquiry",
  "message": "I'm interested in your services..."
}
```

**Required Fields:**
- `name` (string): Visitor's name
- `phone` (string): Visitor's phone number
- `email` (string): Visitor's email address (must be valid)
- `subject` (string): Inquiry subject
- `message` (string): Inquiry message

**Response Success (201):**
```json
{
  "success": true,
  "message": "Your message has been sent successfully",
  "id": "uuid-of-submission"
}
```

**Response Error (400):**
```json
{
  "error": "All fields are required"
}
```

**CORS:** ✅ Enabled for all origins (public API)

## Database Storage

Submissions are stored in the `contact_form_submissions` table with fields:
- `id` (UUID)
- `name` (text)
- `phone` (text)
- `email` (text)
- `subject` (text)
- `message` (text)
- `status` (text): 'new', 'read', or 'responded'
- `createdAt` (timestamp)

## Admin Dashboard

Access submissions at: `/contact-form` (requires authentication)

Features:
- View all submissions in a table
- Search and filter by status
- Click "View" to see full details
- Click "Reply via Email" to respond directly

## Usage Example (React)

```typescript
import { useState } from 'react'

export default function ContactForm() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get('name'),
      phone: formData.get('phone'),
      email: formData.get('email'),
      subject: formData.get('subject'),
      message: formData.get('message'),
    }

    try {
      const response = await fetch('https://your-crm-url.com/api/contact-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error || 'Failed to send message')
      }

      setSuccess(true)
      e.currentTarget.reset()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        name="name"
        placeholder="Your name"
        required
      />
      <input
        type="tel"
        name="phone"
        placeholder="Your number"
        required
      />
      <input
        type="email"
        name="email"
        placeholder="Email address"
        required
      />
      <input
        type="text"
        name="subject"
        placeholder="Subject"
        required
      />
      <textarea
        name="message"
        placeholder="Write message"
        required
      />

      {error && <div className="text-red-600">{error}</div>}
      {success && <div className="text-green-600">Message sent successfully!</div>}

      <button type="submit" disabled={loading}>
        {loading ? 'Sending...' : 'Send Message'}
      </button>
    </form>
  )
}
```

## Email Features

### Confirmation Email to User
- Sent automatically after successful submission
- Confirms receipt of the message
- Shows submitted information

### Admin Notification Email
- Sent to `ADMIN_EMAIL` environment variable
- Contains full submission details
- Includes submission ID for reference

## Configuration

Set in `.env.local`:
```
ADMIN_EMAIL=your-email@example.com
RESEND_API_KEY=your_resend_api_key
```

## Testing

```bash
curl -X POST http://localhost:3000/api/contact-form \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "phone": "555-1234",
    "email": "test@example.com",
    "subject": "Test Subject",
    "message": "Test message"
  }'
```

## Status Values

- `new`: Newly received submission
- `read`: Admin has viewed the submission
- `responded`: Admin has responded to the inquiry

Update status via database or future API updates.
