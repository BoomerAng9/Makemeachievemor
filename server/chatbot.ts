import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Knowledge base from the provided websites
const KNOWLEDGE_BASE = `
ACHIEVEMOR LLC - Trusted Transportation Partner
Location: 275 LONGLEAF CIR, POOLER, GA 31322
Phone: (912) 742-9459
Email: delivered@byachievemor.com
Website: byachievemor.com
DOT Number: 4398142
MC #: 1726115
BOC-3 #: EVILSIZOR PROCESS SERVERS LLC

Services:
- Reliable Transportation: Commitment to dependable transportation, ensuring cargo safety and on-time delivery
- Dedicated Customer Support: Professional and responsive support for all customer needs
- Cost-Effective Solutions: Quality service at competitive prices

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
    const systemPrompt = `You are an expert AI assistant for ACHIEVEMOR LLC, a transportation company helping Owner Operator Independent Contractors. Your role is to provide helpful, accurate information about:

1. DOT and MC Authority setup and requirements
2. Trucking regulations and compliance
3. Getting started as an owner-operator
4. Business formation and licensing
5. Insurance requirements
6. Load finding and freight brokerage
7. Industry resources and tools

Use the following knowledge base to answer questions accurately:

${KNOWLEDGE_BASE}

Guidelines:
- Provide specific, actionable advice
- Reference relevant regulations and requirements
- Suggest appropriate resources from the knowledge base
- Be encouraging but realistic about the trucking industry
- If asked about ACHIEVEMOR specifically, provide the contact information
- For complex regulatory questions, recommend consulting with FMCSA or legal professionals
- Always prioritize safety and legal compliance

Keep responses concise but comprehensive. If you don't have specific information, direct users to the appropriate resources or suggest they contact ACHIEVEMOR directly.

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

    return response.choices[0].message.content || "I apologize, but I couldn't generate a response. Please try again or contact ACHIEVEMOR directly at (912) 742-9459.";
  } catch (error) {
    console.error('Chatbot error:', error);
    return "I'm experiencing technical difficulties. Please contact ACHIEVEMOR directly at (912) 742-9459 or delivered@byachievemor.com for assistance.";
  }
}