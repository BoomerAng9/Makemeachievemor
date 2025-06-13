import OpenAI from "openai";
import { knowledgeBaseService } from "./knowledgeBaseService";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Initialize knowledge base
knowledgeBaseService.initialize();

function formatAuthorityChecklistResponse(checklist: any): string {
  let response = "**CHOOSE 2 ACHIEVEMOR Authority Setup Checklist**\n\n";
  response += "Here's your complete step-by-step checklist for getting your trucking authority:\n\n";
  
  checklist.sections.forEach((section: any, index: number) => {
    response += `**${index + 1}. ${section.title}**\n`;
    section.items.forEach((item: string) => {
      response += `   ✓ ${item}\n`;
    });
    response += "\n";
  });
  
  response += "**Pro Tip**: Check off each item as you complete it. For detailed guidance on any step, just ask me about it!\n\n";
  response += "**Need help with any step?** Call us at (920) 347-8919 or email info@choose2achievemor.us";
  
  return response;
}

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
- Use a professional, helpful tone
- Keep responses comprehensive but concise
- Always include relevant contact information when appropriate`;

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