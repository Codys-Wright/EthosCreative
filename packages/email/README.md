# @email

Email service for the Ethos Creative monorepo.

## Overview

Provides a standard Effect-TS Service interface for sending emails. The current implementation is a **mock** that logs emails to the console — intended to be replaced with a real provider (e.g., [Resend](https://resend.com/)) for production.

## Exports

```typescript
import { EmailService, type EmailMessage, type SendEmailResult } from '@email';
```

### EmailMessage

```typescript
{
  to: string;        // Recipient email
  subject: string;   // Subject line
  html: string;      // HTML body
  text?: string;     // Optional plain text fallback
}
```

### EmailService

An Effect Service with a single `send()` method. The default implementation logs to console and returns `{ success: true, messageId: 'mock-...' }`.

## Usage

The `@auth` package is the primary consumer:

```typescript
import { EmailService } from '@email';

const emailService = yield* EmailService;
yield* emailService.send({
  to: 'user@example.com',
  subject: 'Reset your password',
  html: '<p>Click the link...</p>',
});
```

## Dependencies

None — this is a standalone package with zero internal dependencies.
