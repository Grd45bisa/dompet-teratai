# n8n AI Webhook Integration

Panduan setup integrasi AI untuk ekstraksi data struk otomatis.

## Overview

```
[User Upload Foto] → [Supabase Storage] → [n8n Trigger] → [AI/OCR] → [Update Expense]
```

## Setup n8n Workflow

### 1. Create Webhook Trigger

1. Add **Webhook** node
2. Set HTTP Method: `POST`
3. URL will be generated (save this URL)

### 2. AI Processing

Option A: **Google Vision API**
```json
{
  "image_url": "{{ $json.receipt_url }}",
  "features": [
    { "type": "TEXT_DETECTION" }
  ]
}
```

Option B: **OpenAI GPT-4 Vision**
```json
{
  "model": "gpt-4-vision-preview",
  "messages": [
    {
      "role": "user",
      "content": [
        {
          "type": "text",
          "text": "Extract from this receipt: total amount, date, items. Return JSON format."
        },
        {
          "type": "image_url",
          "url": "{{ $json.receipt_url }}"
        }
      ]
    }
  ]
}
```

### 3. Update Supabase

Add **Supabase** node:
- Operation: Update Row
- Table: expenses
- Filter: id = {{ $json.expense_id }}
- Data:
  ```json
  {
    "amount": "{{ $json.extracted_data.amount }}",
    "description": "{{ $json.extracted_data.description }}",
    "ai_processed": true
  }
  ```

## Trigger from Frontend

When user uploads receipt, POST to n8n webhook:

```typescript
// After saving expense with receipt
const response = await fetch(N8N_WEBHOOK_URL, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    expense_id: newExpense.id,
    receipt_url: receiptUrl,
    user_id: user.id,
  }),
});
```

## Environment Variables

Add to Supabase Edge Function or n8n:

```env
N8N_WEBHOOK_URL=https://your-n8n.app.n8n.cloud/webhook/xxx
OPENAI_API_KEY=sk-xxx (if using OpenAI)
GOOGLE_VISION_API_KEY=xxx (if using Google Vision)
```

## Alternative: Supabase Edge Function

```typescript
// supabase/functions/process-receipt/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

serve(async (req) => {
  const { expense_id, receipt_url } = await req.json()
  
  // Call AI API
  const extracted = await extractFromReceipt(receipt_url)
  
  // Update expense
  await supabase
    .from('expenses')
    .update({ 
      amount: extracted.amount,
      description: extracted.description,
      ai_processed: true 
    })
    .eq('id', expense_id)
  
  return new Response(JSON.stringify({ success: true }))
})
```

## Testing

1. Upload a receipt image
2. Check n8n execution logs
3. Verify expense data updated
4. Check `ai_processed` = true
