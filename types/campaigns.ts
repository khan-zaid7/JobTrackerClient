// File: src/types/campaigns.ts

// This is the new type you need to add.
export interface MatchedPair {
    _id: string;
    userId: string;
    resumeId: string;
    jobId: string;
    matchConfidence: number;
    matchReason: string | null;
    tailoringStatus: 'pending' | 'success' | 'failed' | string;
    campaignId: string;
    createdAt: string;
    updatedAt: string;
}

// Your existing types
export interface Campaign {
    _id: string;
    userId: string;
    targetRole: string;
    status: 'running' | 'stopped' | 'completed';
    createdAt: string;
    updatedAt: string;
}

export interface CampaignStats {
    jobsScraped: number;
    jobsMatched: number;
    jobsTailored: number;
}

export interface CampaignStatusResponse {
    status: string;
    stats: CampaignStats;
}

export interface ScrapedJob {
    _id: string;
    url: string;
    campaignId: string;
    title: string;
    companyName: string;
    location: string;
    description: {
        responsibilities: string[];
        qualifications: string[];
        benefits?: string[];
    };
    // Include any other fields a job might have
    createdAt: string;
}
/**
 * Represents the structured output from the resume analysis pass.
 * Corresponds to the 'analysis' field in the TailoredResume schema.
 */
export interface ResumeAnalysis {
  strengths: string[];
  gaps: string[];
  keywordsToIntegrate: string[];
}

/**
 * Represents the generated "cheat sheet" for interview preparation.
 * Corresponds to the 'interviewPrep' field in the TailoredResume schema.
 */
export interface InterviewPrep {
  talkingPoints: string;
  gapsToAddress: string;
}

/**
 * The complete and updated interface for the TailoredResume document.
 * This matches the Mongoose schema provided.
 */
export interface TailoredResume {
  _id: string;
  userId: string;
  resumeId: string; // The original/master resume ID
  jobId: string;    // The job this resume was tailored for
  campaignId: string;
  
  status: 'pending' | 'success' | 'failed';
  
  // Optional fields that exist upon successful generation
  tailoredText?: string;
  pdfPath?: string;
  confidence?: number;
  tailoredSections?: Record<string, any>; // Flexible object for JSON structure
  
  // ✨ NEW: Optional analysis and interview prep data
  analysis?: ResumeAnalysis;
  interviewPrep?: InterviewPrep;

  // Fields for debugging or error handling
  error?: string;
  rawAIResponse?: Record<string, any>; // Full AI response for debugging

  // Timestamps
  createdAt: string;
  updatedAt: string;
}

export interface Resume {
  _id: string;
  originalName: string;
  filePath: string;
  textContent: string;
  isMaster: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface JobDetailsResponse extends ScrapedJob {
tailoredResume: TailoredResume | null;
originalResume: Resume | null;
}