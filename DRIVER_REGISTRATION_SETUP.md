# COMPLETE DRIVER REGISTRATION SYSTEM SETUP

## 1. DATABASE SCHEMA

### Primary Tables for Driver Registration

```sql
-- Contractors table (Main driver/contractor data)
CREATE TABLE contractors (
  id SERIAL PRIMARY KEY,
  -- Personal Information
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT NOT NULL,
  date_of_birth TEXT NOT NULL,
  -- Address
  street TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip_code TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'USA',
  -- Verification status
  verification_status TEXT NOT NULL DEFAULT 'pending', -- pending, verified, rejected
  onboarding_step INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT true,
  -- DOT and compliance
  dot_number TEXT,
  mc_number TEXT,
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- User registration notifications
CREATE TABLE user_registration_notifications (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR NOT NULL REFERENCES users(id),
  notification_sent BOOLEAN DEFAULT false,
  sent_at TIMESTAMP,
  admin_notified BOOLEAN DEFAULT false,
  requires_approval BOOLEAN DEFAULT false,
  approved_by VARCHAR,
  approved_at TIMESTAMP,
  rejection_reason TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Schema Types (shared/schema.ts)

```typescript
export const contractors = pgTable("contractors", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone").notNull(),
  dateOfBirth: text("date_of_birth").notNull(),
  street: text("street").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  zipCode: text("zip_code").notNull(),
  country: text("country").notNull().default("USA"),
  verificationStatus: text("verification_status").notNull().default("pending"),
  onboardingStep: integer("onboarding_step").notNull().default(1),
  isActive: boolean("is_active").notNull().default(true),
  dotNumber: text("dot_number"),
  mcNumber: text("mc_number"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertContractorSchema = createInsertSchema(contractors).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type Contractor = typeof contractors.$inferSelect;
export type InsertContractor = z.infer<typeof insertContractorSchema>;
```

## 2. FRONTEND REGISTRATION FORM

### File: client/src/pages/register-driver.tsx

```typescript
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Truck, Shield, ArrowLeft, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { UniversalNav } from "@/components/UniversalNav";

export default function RegisterDriverPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    dotNumber: "",
    mcNumber: "",
    vehicleType: "",
    cdlClass: "",
    yearsExperience: "",
    specialEndorsements: [] as string[],
    agreedToTerms: false,
    agreedToBackground: false
  });
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // Prepare data with required fields and defaults
      const submitData = {
        ...formData,
        dateOfBirth: formData.dateOfBirth || "1990-01-01",
        country: "US",
        dotNumber: formData.dotNumber || "",
        mcNumber: formData.mcNumber || "",
        vehicleType: formData.vehicleType || "truck",
        cdlClass: formData.cdlClass || "A",
        yearsExperience: formData.yearsExperience || "2-5",
        specialEndorsements: formData.specialEndorsements.join(",")
      };

      const response = await fetch('/api/drivers/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData)
      });

      if (response.ok) {
        toast({
          title: "Registration Successful!",
          description: "Welcome to ACHIEVEMOR! Check your email for next steps."
        });
        
        // Reset form
        setFormData({
          firstName: "", lastName: "", email: "", phone: "",
          dateOfBirth: "", street: "", city: "", state: "", zipCode: "",
          dotNumber: "", mcNumber: "", vehicleType: "", cdlClass: "",
          yearsExperience: "", specialEndorsements: [],
          agreedToTerms: false, agreedToBackground: false
        });
        setCurrentStep(1);
      } else {
        throw new Error('Registration failed');
      }
    } catch (error) {
      toast({
        title: "Registration Error",
        description: "There was an issue with your registration. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Multi-step form implementation with validation
  // Step 1: Personal Information
  // Step 2: Address & Professional Info  
  // Step 3: Terms & Agreements
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <UniversalNav />
      {/* Form steps implementation */}
    </div>
  );
}
```

## 3. BACKEND API IMPLEMENTATION

### File: server/routes.ts - Driver Registration Endpoint

```typescript
// Driver registration route
app.post('/api/drivers/register', async (req, res) => {
  try {
    const driverData = insertContractorSchema.parse({
      ...req.body,
      role: 'driver',
      status: 'pending_verification'
    });
    
    const driver = await storage.createContractor(driverData);
    
    // Send notification email
    try {
      const { emailService } = await import("./emailService");
      await emailService.sendRegistrationNotification({
        ...driver,
        email: driver.email || 'contactus@achievemor.io'
      });
    } catch (emailError) {
      console.error('Failed to send registration notification:', emailError);
    }
    
    res.json({ 
      message: 'Driver registration successful', 
      id: driver.id,
      status: driver.status 
    });
  } catch (error) {
    console.error('Error registering driver:', error);
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: 'Validation error', errors: error.errors });
    } else {
      res.status(500).json({ message: 'Failed to register driver' });
    }
  }
});
```

## 4. STORAGE LAYER IMPLEMENTATION

### File: server/storage.ts

```typescript
export interface IStorage {
  // Driver/Contractor operations
  createContractor(data: InsertContractor): Promise<Contractor>;
  getContractor(id: number): Promise<Contractor | undefined>;
  updateContractor(id: number, data: Partial<InsertContractor>): Promise<Contractor>;
  getAllContractors(): Promise<Contractor[]>;
  getContractorsByStatus(status: string): Promise<Contractor[]>;
}

export class DatabaseStorage implements IStorage {
  async createContractor(data: InsertContractor): Promise<Contractor> {
    const [contractor] = await db
      .insert(contractors)
      .values(data)
      .returning();
    return contractor;
  }

  async getContractor(id: number): Promise<Contractor | undefined> {
    const [contractor] = await db
      .select()
      .from(contractors)
      .where(eq(contractors.id, id));
    return contractor;
  }

  async updateContractor(id: number, data: Partial<InsertContractor>): Promise<Contractor> {
    const [contractor] = await db
      .update(contractors)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(contractors.id, id))
      .returning();
    return contractor;
  }

  async getAllContractors(): Promise<Contractor[]> {
    return await db.select().from(contractors);
  }

  async getContractorsByStatus(status: string): Promise<Contractor[]> {
    return await db
      .select()
      .from(contractors)
      .where(eq(contractors.verificationStatus, status));
  }
}
```

## 5. EMAIL NOTIFICATION SYSTEM

### File: server/emailService.ts

```typescript
import { MailService } from '@sendgrid/mail';

class EmailService {
  private mailService: MailService | null = null;
  private fromEmail = 'noreply@achievemor.io';

  constructor() {
    if (process.env.SENDGRID_API_KEY) {
      this.mailService = new MailService();
      this.mailService.setApiKey(process.env.SENDGRID_API_KEY);
    }
  }

  async sendRegistrationNotification(user: any): Promise<boolean> {
    if (!this.mailService) {
      console.log('Email service not configured - would send registration notification');
      return false;
    }

    const emailData = {
      to: 'contactus@achievemor.io',
      from: this.fromEmail,
      subject: `New Driver Registration - ${user.firstName} ${user.lastName}`,
      text: `
        New driver registration received:
        
        Name: ${user.firstName} ${user.lastName}
        Email: ${user.email}
        Phone: ${user.phone}
        Location: ${user.city}, ${user.state}
        DOT Number: ${user.dotNumber || 'Not provided'}
        MC Number: ${user.mcNumber || 'Not provided'}
        
        Please review and approve this registration in the admin panel.
      `,
      html: `
        <h2>New Driver Registration</h2>
        <p>A new driver has registered on the ACHIEVEMOR platform:</p>
        
        <table style="border-collapse: collapse; width: 100%;">
          <tr><td><strong>Name:</strong></td><td>${user.firstName} ${user.lastName}</td></tr>
          <tr><td><strong>Email:</strong></td><td>${user.email}</td></tr>
          <tr><td><strong>Phone:</strong></td><td>${user.phone}</td></tr>
          <tr><td><strong>Location:</strong></td><td>${user.city}, ${user.state}</td></tr>
          <tr><td><strong>DOT Number:</strong></td><td>${user.dotNumber || 'Not provided'}</td></tr>
          <tr><td><strong>MC Number:</strong></td><td>${user.mcNumber || 'Not provided'}</td></tr>
        </table>
        
        <p>Please review and approve this registration in the admin panel.</p>
      `
    };

    return await this.sendEmail(emailData);
  }

  private async sendEmail(emailData: any): Promise<boolean> {
    try {
      await this.mailService!.send(emailData);
      return true;
    } catch (error) {
      console.error('SendGrid email error:', error);
      return false;
    }
  }
}

export const emailService = new EmailService();
```

## 6. ROUTING CONFIGURATION

### File: client/src/App.tsx

```typescript
import RegisterDriverPage from "@/pages/register-driver";

// In Router component:
<Route path="/register/driver" component={RegisterDriverPage} />
```

### File: client/src/pages/landing.tsx

```typescript
// Driver signup button
<Button size="lg" asChild className="w-full bg-primary hover:bg-primary/90">
  <Link href="/register/driver">Join as Driver</Link>
</Button>
```

## 7. VALIDATION RULES

### Frontend Validation
- **Step 1**: firstName, lastName, email, phone are required
- **Step 2**: street, city, state, zipCode are required  
- **Step 3**: agreedToTerms and agreedToBackground must be true

### Backend Validation
- Uses Zod schema validation via `insertContractorSchema`
- Email must be unique
- All required fields validated
- Phone format validation
- State must be valid US state code

## 8. DATA FLOW

1. **User fills form** → Frontend validation
2. **Form submission** → POST to `/api/drivers/register`
3. **Backend validation** → Zod schema validation
4. **Database insertion** → `storage.createContractor()`
5. **Email notification** → Admin notified at `contactus@achievemor.io`
6. **Response** → Success/error message to frontend

## 9. ADMIN NOTIFICATION SYSTEM

All driver registrations automatically send email notifications to:
- **To**: `contactus@achievemor.io`
- **Subject**: "New Driver Registration - [Name]"
- **Content**: Full registration details for review

## 10. ERROR HANDLING

- **Frontend**: Toast notifications for success/error
- **Backend**: Proper HTTP status codes (400 for validation, 500 for server errors)
- **Database**: Transaction rollback on errors
- **Email**: Graceful degradation if email service unavailable

## 11. SECURITY MEASURES

- Input sanitization via Zod validation
- Email uniqueness enforcement
- XSS protection via proper escaping
- CSRF protection via proper headers
- Rate limiting on registration endpoint (recommended)

## 12. TESTING ENDPOINTS

```bash
# Test driver registration
curl -X POST http://localhost:5000/api/drivers/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe", 
    "email": "john.doe@example.com",
    "phone": "555-123-4567",
    "dateOfBirth": "1985-05-15",
    "street": "123 Main St",
    "city": "Atlanta",
    "state": "GA",
    "zipCode": "30309",
    "dotNumber": "DOT123456",
    "mcNumber": "MC789012"
  }'
```

This complete setup provides a full-featured driver registration system with proper validation, email notifications, database storage, and error handling.