import fs from 'fs';
import path from 'path';

export interface KnowledgeBaseItem {
  id: string;
  category: string;
  q: string;
  a: string;
}

export interface AuthorityChecklistSection {
  title: string;
  items: string[];
}

export interface AuthorityChecklist {
  sections: AuthorityChecklistSection[];
}

class KnowledgeBaseService {
  private knowledgeBase: KnowledgeBaseItem[] = [];
  private authorityChecklist: AuthorityChecklist | null = null;
  private initialized = false;

  async initialize() {
    if (this.initialized) return;
    
    try {
      // Load knowledge base from YAML-like format
      const kbPath = path.join(process.cwd(), 'server', 'kb.yml');
      const kbContent = fs.readFileSync(kbPath, 'utf8');
      this.knowledgeBase = this.parseKnowledgeBase(kbContent);
      
      // Load authority checklist
      const checklistPath = path.join(process.cwd(), 'server', 'authority_checklist.json');
      const checklistContent = fs.readFileSync(checklistPath, 'utf8');
      this.authorityChecklist = JSON.parse(checklistContent);
      
      this.initialized = true;
      console.log(`Loaded ${this.knowledgeBase.length} knowledge base items`);
    } catch (error) {
      console.error('Failed to initialize knowledge base:', error);
    }
  }

  private parseKnowledgeBase(content: string): KnowledgeBaseItem[] {
    const items: KnowledgeBaseItem[] = [];
    const lines = content.split('\n');
    let currentItem: Partial<KnowledgeBaseItem> = {};
    let inAnswer = false;
    let answerLines: string[] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      
      if (trimmed.startsWith('- id:')) {
        // Save previous item if exists
        if (currentItem.id) {
          if (answerLines.length > 0) {
            currentItem.a = answerLines.join('\n').trim();
          }
          items.push(currentItem as KnowledgeBaseItem);
          answerLines = [];
        }
        
        // Start new item
        currentItem = { id: trimmed.replace('- id:', '').trim() };
        inAnswer = false;
      } else if (trimmed.startsWith('category:')) {
        currentItem.category = trimmed.replace('category:', '').trim();
      } else if (trimmed.startsWith('q:')) {
        currentItem.q = trimmed.replace('q:', '').trim();
      } else if (trimmed.startsWith('a: >')) {
        inAnswer = true;
        answerLines = [];
      } else if (inAnswer && trimmed && !trimmed.startsWith('#')) {
        answerLines.push(trimmed);
      } else if (trimmed.startsWith('#') || trimmed === '') {
        // Comments or empty lines end answer collection
        if (inAnswer && answerLines.length > 0) {
          currentItem.a = answerLines.join('\n').trim();
          answerLines = [];
          inAnswer = false;
        }
      }
    }

    // Save last item
    if (currentItem.id) {
      if (answerLines.length > 0) {
        currentItem.a = answerLines.join('\n').trim();
      }
      items.push(currentItem as KnowledgeBaseItem);
    }

    return items;
  }

  searchKnowledgeBase(query: string): KnowledgeBaseItem[] {
    if (!this.initialized) return [];
    
    const lowercaseQuery = query.toLowerCase();
    const results: Array<{ item: KnowledgeBaseItem; score: number }> = [];

    for (const item of this.knowledgeBase) {
      let score = 0;
      
      // Exact matches in question get highest score
      if (item.q.toLowerCase().includes(lowercaseQuery)) {
        score += 10;
      }
      
      // Matches in answer get medium score
      if (item.a.toLowerCase().includes(lowercaseQuery)) {
        score += 5;
      }
      
      // Category matches get lower score
      if (item.category.toLowerCase().includes(lowercaseQuery)) {
        score += 3;
      }
      
      // Keyword matching
      const keywords = lowercaseQuery.split(' ');
      for (const keyword of keywords) {
        if (keyword.length > 2) {
          if (item.q.toLowerCase().includes(keyword)) score += 2;
          if (item.a.toLowerCase().includes(keyword)) score += 1;
        }
      }
      
      if (score > 0) {
        results.push({ item, score });
      }
    }

    // Sort by score and return top results
    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map(result => result.item);
  }

  getKnowledgeBaseByCategory(category?: string): KnowledgeBaseItem[] {
    if (!this.initialized) return [];
    
    if (!category) {
      return this.knowledgeBase;
    }
    
    return this.knowledgeBase.filter(item => 
      item.category.toLowerCase() === category.toLowerCase()
    );
  }

  getAuthorityChecklist(): AuthorityChecklist | null {
    return this.authorityChecklist;
  }

  getAllCategories(): string[] {
    if (!this.initialized) return [];
    
    const categories = new Set(this.knowledgeBase.map(item => item.category));
    return Array.from(categories);
  }

  formatKnowledgeBaseForAI(): string {
    if (!this.initialized) return '';
    
    let formatted = "KNOWLEDGE BASE:\n\n";
    
    const categories = this.getAllCategories();
    for (const category of categories) {
      formatted += `## ${category}\n\n`;
      const items = this.getKnowledgeBaseByCategory(category);
      
      for (const item of items) {
        formatted += `Q: ${item.q}\n`;
        formatted += `A: ${item.a}\n\n`;
      }
    }
    
    if (this.authorityChecklist) {
      formatted += "\nAUTHORITY SETUP CHECKLIST:\n\n";
      for (const section of this.authorityChecklist.sections) {
        formatted += `### ${section.title}\n`;
        for (const item of section.items) {
          formatted += `- ${item}\n`;
        }
        formatted += "\n";
      }
    }
    
    return formatted;
  }

  isAuthorityChecklistRequest(message: string): boolean {
    const triggers = [
      'authority checklist',
      'show authority checklist',
      'setup checklist',
      'authority setup',
      'dot checklist',
      'mc authority checklist',
      '/checklist'
    ];
    
    const lowercaseMessage = message.toLowerCase();
    return triggers.some(trigger => lowercaseMessage.includes(trigger));
  }
}

export const knowledgeBaseService = new KnowledgeBaseService();