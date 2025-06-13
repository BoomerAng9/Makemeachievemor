import OpenAI from "openai";
import { knowledgeBaseService } from "./knowledgeBaseService";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Initialize knowledge base
knowledgeBaseService.initialize();

function formatAuthorityChecklistResponse(checklist: any): string {
  let response = "🚛 **CHOOSE 2 ACHIEVEMOR Authority Setup Checklist**\n\n";
  response += "Here's your complete step-by-step checklist for getting your trucking authority:\n\n";
  
  checklist.sections.forEach((section: any, index: number) => {
    response += `**${index + 1}. ${section.title}**\n`;
    section.items.forEach((item: string) => {
      response += `   ✓ ${item}\n`;
    });
    response += "\n";
  });
  
  response += "💡 **Pro Tip**: Check off each item as you complete it. For detailed guidance on any step, just ask me about it!\n\n";
  response += "📞 Need help with any step? Call us at (920) 347-8919 or email info@choose2achievemor.us";
  
  return response;
}
const KNOWLEDGE_BASE = `
ACHIEVEMOR LLC - Comprehensive Owner Operator Platform
Location: 275 LONGLEAF CIR, POOLER, GA 31322
Phone: (912) 742-9459
Email: delivered@byachievemor.com
Website: byachievemor.com
DOT Number: 4398142
MC #: 1726115
BOC-3 #: EVILSIZOR PROCESS SERVERS LLC

Platform Services:
- Authority Setup Checklist: Comprehensive 30-item compliance tracking system
- AI-Powered Dashboard: Personalized insights and next-step recommendations
- Background Check Integration: Automated screening with multiple provider support
- User Account Integration: Progress saved with resume capability across devices
- Security Protection: Screenshot and screen recording prevention on sensitive pages
- Completion Workflow: Direct integration with needs analysis form and team contact

Authority Setup Checklist - 30 Essential Items:

1. FEDERAL AUTHORITY & REGISTRATION (5 items):
   - MC Number (Motor Carrier Authority)
   - DOT Number Registration
   - USDOT Registration Completed
   - Interstate Operating Authority
   - Process Agent Designation

2. BUSINESS FORMATION & TAX SETUP (5 items):
   - Business Entity Formation (LLC/Corp)
   - EIN (Employer Identification Number)
   - State Business Registration
   - Quarterly Tax Setup (Form 2290)
   - Tax Professional/CPA Consultation

3. INSURANCE & FINANCIAL COMPLIANCE (5 items):
   - General Liability Insurance ($750K-$1M)
   - Cargo Insurance ($100K minimum)
   - BOC-3 Process Agent Filing
   - Surety Bond or Trust Fund ($75K)
   - Workers' Compensation (if employees)

4. VEHICLE & EQUIPMENT REQUIREMENTS (5 items):
   - Commercial Motor Vehicle (CDL Class)
   - Vehicle Registration & Title
   - IFTA (International Fuel Tax Agreement)
   - IRP (International Registration Plan)
   - DOT Vehicle Inspection & Decals

5. PERMITS & ONGOING COMPLIANCE (5 items):
   - State Operating Permits
   - Oversize/Overweight Permits (if needed)
   - Hazmat Permits (if applicable)
   - Drug & Alcohol Testing Program
   - Driver Qualification Files

6. OPERATIONAL SYSTEMS & TECHNOLOGY (5 items):
   - ELD (Electronic Logging Device)
   - Load Board Subscriptions
   - Dispatch & Fleet Management Software
   - Accounting & Bookkeeping System
   - Communication Tools & Mobile Apps

Checklist Features:
- User Account Integration: Progress automatically saved to authenticated accounts
- Resume Capability: Pause and continue from any device with account sync
- Security Measures: Screenshot and screen recording disabled for compliance protection
- Clear/Restart: Full progress reset with confirmation prompts
- Completion Workflow: Direct integration with needs analysis form (https://achvmr-forms.paperform.co/) or team contact (delivered@byachievemor.com)
- Export Functionality: Download comprehensive progress reports with user information
- Platform Access: Available at /driver-checklist for comprehensive authority setup tracking

Support Resources:
- Needs Analysis Form: https://achvmr-forms.paperform.co/
- Team Contact: delivered@byachievemor.com
- Authority Setup Checklist: /driver-checklist

CARRIERFORGE - Trucking Startups Made Easy
Website: carrierforge.com
Phone: (920) 347-8919
Email: info@carrierforge.com
Address: 3171 Packerland Dr, Green Bay, WI 54313

Services:
- DOT# & MC Authority filing made easy
- Personalized guidance for trucking business setup
- Business formation, insurance, and finding first loads
- Freight Academy for operating cost calculations and broker interactions
- Ongoing support with mentors and compliance monitoring

OOIDA (Owner-Operator Independent Drivers Association)
Website: ooida.com
The largest organization representing professional truck drivers since 1973
150,000+ members working for positive change in trucking

Services:
- Truck Insurance for owner-operators
- Business services including permits & licensing
- DOT compliance assistance
- Form 2290 filing
- Drug & alcohol testing programs
- Fuel card programs and equipment discounts

Key Resources:
- Cost Per Mile calculator
- Fuel Surcharge Calculator
- Leasing Regulations Q&A
- DOT Physical requirements
- CDL qualification guidance

DAT (Digital Advertising Technology)
Website: dat.com
The largest freight network in North America
$1T+ in freight transactions annually
235M+ loads posted annually
148K transactions per minute

Services:
- Load Board (largest truckload marketplace)
- Trucking Operating Authority
- Load Tracking powered by Trucker Tools
- Smart Factoring with rates as low as 1.0%
- Market analytics and insights

TRUCKING TRUTH
Website: truckingtruth.com
Comprehensive trucking industry guidance

Resources:
- Trucker's Forum for community support
- Truck Driver's Career Guide
- CDL training and practice tests
- High Road Training Program
- Company reviews and job guidance
- Salary information and pay structures

FREIGHTWAVES
Website: freightwaves.com
Market intelligence and analytics for freight industry

TRUCKINGINFO
Website: truckinginfo.com
Industry news, fleet management insights, and safety compliance information

Compliance Requirements for Owner Operators:
1. Valid Commercial Driver's License (CDL)
2. DOT Number registration
3. MC Number (Motor Carrier Authority)
4. DOT Medical Certificate
5. Vehicle Registration & Title
6. Liability Insurance
7. Cargo Insurance
8. BOC-3 Filing
9. IFTA Registration (if operating interstate)
10. IRP Registration (for interstate operations)

Key Regulations:
- Hours of Service (HOS) regulations
- Electronic Logging Device (ELD) requirements
- Drug and alcohol testing programs
- Vehicle inspection requirements
- Weight and size limitations
- Hazmat endorsements when required

Getting Started Checklist:
1. Obtain CDL with appropriate endorsements
2. Pass DOT physical examination
3. Choose business structure (LLC, Corporation, etc.)
4. Apply for DOT Number
5. Apply for MC Authority
6. File BOC-3 process agent designation
7. Obtain required insurance coverage
8. Register for IFTA and IRP if needed
9. Set up accounting and record-keeping systems
10. Find loads through load boards or freight brokers
`;

export async function generateChatbotResponse(message: string, context?: string): Promise<string> {
  try {
    // Check if this is an authority checklist request
    if (knowledgeBaseService.isAuthorityChecklistRequest(message)) {
      const checklist = knowledgeBaseService.getAuthorityChecklist();
      if (checklist) {
        return formatAuthorityChecklistResponse(checklist);
      }
    }

    // Search knowledge base for relevant information
    const searchResults = knowledgeBaseService.searchKnowledgeBase(message);
    let contextualInfo = '';
    
    if (searchResults.length > 0) {
      contextualInfo = '\n\nRelevant information from knowledge base:\n';
      searchResults.forEach((item, index) => {
        contextualInfo += `${index + 1}. Q: ${item.q}\n   A: ${item.a}\n\n`;
      });
    }

    const knowledgeBase = knowledgeBaseService.formatKnowledgeBaseForAI();
    
    const systemPrompt = `You are an expert AI assistant for CHOOSE 2 ACHIEVEMOR, a comprehensive platform helping Owner Operator Independent Contractors. Your role is to provide helpful, accurate information about:

1. DOT and MC Authority setup and requirements
2. Trucking regulations and compliance
3. Getting started as an owner-operator
4. Business formation and licensing
5. Insurance requirements
6. Load finding and freight brokerage
7. Industry resources and tools
8. Authority Setup Checklist navigation and features
9. Platform features including user account integration and progress tracking

Use the following knowledge base to answer questions accurately:

${knowledgeBase}

Contact Information:
- Phone: (920) 347-8919
- Email: info@choose2achievemor.us
- Office Hours: 7 a.m.–5 p.m. CT, Monday-Friday

When users ask about the authority checklist, guide them to type "show authority checklist" or mention that the interactive checklist covers USDOT, MC, insurance, fuel tax, plates, and compliance items.

Always provide accurate, helpful information based on the knowledge base. If you don't have specific information, direct users to contact support.${contextualInfo}

Guidelines:
- Provide specific, actionable advice with step-by-step guidance
- Reference the Authority Setup Checklist when users ask about compliance requirements
- Direct users to /driver-checklist for comprehensive authority setup tracking
- For business setup questions, recommend the needs analysis form at https://achvmr-forms.paperform.co/
- Reference relevant regulations and requirements with specific details
- Suggest appropriate resources from the knowledge base
- Be encouraging but realistic about the trucking industry
- If asked about ACHIEVEMOR specifically, provide the contact information
- For complex regulatory questions, recommend consulting with FMCSA or legal professionals
- Always prioritize safety and legal compliance
- Guide users to create accounts for progress saving and resume capability
- Mention security features when discussing sensitive compliance information

Special Platform Features to Highlight:
- Authority Setup Checklist with 30 essential items across 6 categories
- User account integration for progress persistence across devices
- Security protection on sensitive pages
- AI-powered dashboard with personalized insights
- Background check integration for compliance
- Direct completion workflow with needs analysis form

Keep responses concise but comprehensive. If you don't have specific information, direct users to the appropriate resources or suggest they contact ACHIEVEMOR directly at delivered@byachievemor.com.

${context ? `\nAdditional context: ${context}` : ''}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      max_tokens: 800,
      temperature: 0.7,
    });

    return response.choices[0].message.content || "I apologize, but I couldn't generate a response. Please try again or contact CHOOSE 2 ACHIEVEMOR directly at (920) 347-8919.";
  } catch (error) {
    console.error('Chatbot error:', error);
    return "I'm experiencing technical difficulties. Please contact CHOOSE 2 ACHIEVEMOR directly at (920) 347-8919 or info@choose2achievemor.us for assistance.";
  }
}