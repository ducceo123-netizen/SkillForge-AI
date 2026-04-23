export type Skill = {
  id: string;
  name: string;
  description: string;
  systemPromptTemplate: string;
  variables: InputField[];
  model: string;
  temperature: number;
  lastRun?: string;
  runCount: number;
  ownerId?: string;
  orgId?: string;
  createdAt?: any;
  updatedAt?: any;
};

export type InputField = {
  id: string;
  name: string;
  label: string;
  type: 'short_text' | 'long_text' | 'select';
  placeholder?: string;
  options?: string[];
  required: boolean;
};

export type BrandProfile = {
  id: string;
  name: string;
  guidelines: string;
  attributes: string[];
  knowledgeFiles?: KnowledgeFile[];
  updatedAt: string;
  isDefault: boolean;
  linkedSkills: number;
  logoUrl?: string;
  ownerId?: string;
  orgId?: string;
  createdAt?: any;
};

export type KnowledgeFile = {
  id: string;
  name: string;
  type: string;
  size: number;
  content?: string; // Optional: store small text content or links
  createdAt: string;
};

export type Execution = {
  id: string;
  skillId: string;
  inputData: Record<string, any>;
  output: string;
  timestamp: any;
  status: 'adopted' | 'edited' | 'pending';
  ownerId?: string;
  orgId?: string;
};
