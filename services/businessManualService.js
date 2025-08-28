import { db, collections } from "../config/firebase.js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

/**
 * Business Manual Service - Handle business manual submissions and responses
 */
export class BusinessManualService {
  /**
   * Submit a new business manual request
   */
  static async submitBusinessManual(submissionData) {
    try {
      const submissionRef = db
        .collection(collections.BUSINESS_MANUAL_SUBMISSION)
        .doc();
      const submission = {
        id: submissionRef.id,
        ...submissionData,
        status: "submitted",
        submittedAt: new Date(),
        updatedAt: new Date(),
      };

      await submissionRef.set(submission);
      return { success: true, data: submission };
    } catch (error) {
      console.error("Error submitting business manual:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Generate business manual response using OpenRouter (Mistral AI)
   */
  static async generateBusinessManual(submissionData) {
    try {
      const prompt = this.buildBusinessManualPrompt(submissionData);

      const response = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          },
          body: JSON.stringify({
            model: "mistralai/mistral-7b-instruct:free",
            messages: [
              {
                role: "user",
                content: prompt,
              },
            ],
            max_tokens: 4000,
            temperature: 0.7,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("OpenRouter API Error Details:", {
          status: response.status,
          statusText: response.statusText,
          error: errorData,
        });

        let errorMessage = `OpenRouter API error: ${response.status} ${response.statusText}`;

        if (response.status === 401) {
          errorMessage =
            "Invalid API key. Please check your OpenRouter API key configuration.";
        } else if (response.status === 403) {
          errorMessage =
            "API key does not have permission to access this resource.";
        } else if (response.status === 429) {
          errorMessage = "API rate limit exceeded. Please try again later.";
        } else if (response.status >= 500) {
          errorMessage = "OpenRouter API server error. Please try again later.";
        } else if (errorData.error?.message) {
          errorMessage += `. ${errorData.error.message}`;
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();
      const generatedContent = data.choices[0].message.content;

      return { success: true, data: generatedContent };
    } catch (error) {
      console.error("Error generating business manual:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Build the prompt for Mistral AI based on submission data
   */
  static buildBusinessManualPrompt(submissionData) {
    return `Generate a comprehensive business manual for the following business. The response should be structured as a complete business guide with detailed sections, similar to professional business consulting reports.

Business Details:
- Business Niche: ${submissionData.businessNiche || "Not specified"}
- Location: ${submissionData.location || "Not specified"}
- Store Type: ${submissionData.storeType || "Not specified"}
- Business Stage: ${submissionData.businessStage || "Planning"}
- Budget Range: $${submissionData.budgetRange?.[0] || 5000} - $${
      submissionData.budgetRange?.[1] || 20000
    }
- Annual Revenue Goal: $${submissionData.annualRevenueGoal || 50000}
- Brand Tone: ${submissionData.brandTone || "Professional"}
- Target Age Group: ${submissionData.targetAgeGroup?.[0] || 25} - ${
      submissionData.targetAgeGroup?.[1] || 45
    } years
- Weekly Time Allocation: ${submissionData.weeklyTimeAllocation || 40} hours
- Experience Level: ${submissionData.experienceLevel || "Intermediate"}

Please generate a detailed business manual with the following EXACT structure and formatting. Use markdown formatting with proper headings, subheadings, bullet points, and numbered lists. Make it comprehensive and actionable:

# BUSINESS MANUAL: ${
      submissionData.businessNiche || "Your Business"
    } Setup Guide

## EXECUTIVE SUMMARY
- Overview of the business concept and goals
- Key objectives and success metrics
- Summary of recommendations tailored to the business details above

## BUSINESS SETUP
### 1. Market Research and Analysis
- Target market analysis for ${submissionData.location || "your location"}
- Competitor analysis and positioning strategy
- Customer persona development for ages ${
      submissionData.targetAgeGroup?.[0] || 25
    }-${submissionData.targetAgeGroup?.[1] || 45}

### 2. Business Plan Development
- Executive summary and business objectives
- SWOT analysis specific to ${submissionData.businessNiche || "your business"}
- Service/product offerings and pricing strategy

### 3. Location and Setup
- Location selection criteria for ${submissionData.location || "your area"}
- Physical space requirements for ${
      submissionData.storeType || "your business type"
    }
- Interior design recommendations matching ${
      submissionData.brandTone || "professional"
    } tone

### 4. Legal and Regulatory Compliance
- Business registration requirements
- Necessary licenses and permits for ${
      submissionData.location || "your location"
    }
- Legal consultation recommendations

### 5. Financial Planning
- Budget allocation within $${submissionData.budgetRange?.[0] || 5000} - $${
      submissionData.budgetRange?.[1] || 20000
    } range
- Revenue streams to achieve $${submissionData.annualRevenueGoal || 50000} goal
- Cash flow management strategies

## EQUIPMENT & INFRASTRUCTURE
### Office Space
- Location recommendations in ${submissionData.location || "your area"}
- Space requirements for ${submissionData.businessNiche || "your business"}
- Layout and design considerations

### Technology Setup
- Computer and hardware requirements
- Software licenses and development tools
- Networking and security infrastructure

### Furniture and Office Supplies
- Ergonomic workspace setup
- Meeting room and common area requirements
- Budget breakdown for equipment

## HR & STAFFING
### Team Structure
- Key roles and responsibilities for ${
      submissionData.businessNiche || "your business"
    }
- Hiring strategy for ${
      submissionData.experienceLevel || "intermediate"
    } level team
- Team size recommendations based on budget

### Recruitment Process
- Job descriptions and requirements
- Interview and selection process
- Onboarding and training programs

### Compliance and Legal
- Employment law compliance
- Salary structures within budget constraints
- Performance management systems

## FINANCIAL PLANNING
### Startup Costs Breakdown
- One-time setup costs within $${submissionData.budgetRange?.[0] || 5000} - $${
      submissionData.budgetRange?.[1] || 20000
    }
- Monthly operational expenses
- Contingency fund allocation

### Revenue Projections
- Pricing strategy for services
- Sales forecasting to reach $${submissionData.annualRevenueGoal || 50000}
- Break-even analysis

### Funding and Investment
- Bootstrap strategies
- Funding options for growth
- Financial management tools

## INVENTORY & SUPPLY CHAIN
### Inventory Management
- Inventory requirements for ${submissionData.businessNiche || "your business"}
- Stock management systems
- Supplier relationship management

### Supply Chain Setup
- Vendor selection criteria
- Procurement processes
- Quality control measures

### Logistics and Operations
- Order fulfillment processes
- Inventory tracking systems
- Cost optimization strategies

## MARKETING STRATEGY
### Target Audience Analysis
- Detailed persona for ages ${submissionData.targetAgeGroup?.[0] || 25}-${
      submissionData.targetAgeGroup?.[1] || 45
    }
- Customer journey mapping
- Brand positioning strategy

### Marketing Channels
- Digital marketing strategies
- Local marketing approaches
- Content marketing plan

### Budget Allocation
- Marketing budget breakdown
- Campaign planning and execution
- Performance measurement

## COMPLIANCE & LEGAL
### Business Registration
- Legal structure options
- Registration process in ${submissionData.location || "your location"}
- Required documentation

### Regulatory Compliance
- Industry-specific regulations
- Tax compliance requirements
- Data protection and privacy laws

### Risk Management
- Legal risk assessment
- Insurance requirements
- Compliance monitoring

## PARTNERSHIP & COMMUNITY
### Strategic Partnerships
- Potential partners for ${submissionData.businessNiche || "your business"}
- Partnership development strategy
- Collaboration opportunities

### Community Engagement
- Local community involvement
- Networking strategies
- Reputation building

### Affiliate Programs
- Referral program setup
- Influencer partnerships
- Community ambassador programs

## SCALABILITY PLAN
### Growth Strategy
- 12-month growth roadmap
- Expansion opportunities
- Market penetration strategies

### Operational Scaling
- Team expansion planning
- Process optimization
- Technology scaling

### Financial Scaling
- Investment requirements
- Revenue scaling strategies
- Exit strategies

Make this manual highly personalized to the business details provided. Use the ${
      submissionData.brandTone || "professional"
    } tone throughout. Be specific with numbers, timelines, and actionable steps. Ensure all recommendations are realistic within the given budget range and align with the target audience and business stage.`;
  }

  /**
   * Get business manual submission by ID
   */
  static async getSubmissionById(submissionId) {
    try {
      const submissionDoc = await db
        .collection(collections.BUSINESS_MANUAL_SUBMISSION)
        .doc(submissionId)
        .get();

      if (!submissionDoc.exists) {
        return { success: false, error: "Submission not found" };
      }

      return { success: true, data: submissionDoc.data() };
    } catch (error) {
      console.error("Error getting submission:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get all submissions for a user
   */
  static async getSubmissionsByUser(userId, limit = 10) {
    try {
      const querySnapshot = await db
        .collection(collections.BUSINESS_MANUAL_SUBMISSION)
        .where("userId", "==", userId)
        .orderBy("submittedAt", "desc")
        .limit(limit)
        .get();

      const submissions = querySnapshot.docs.map((doc) => doc.data());
      return { success: true, data: submissions };
    } catch (error) {
      console.error("Error getting user submissions:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update submission status
   */
  static async updateSubmissionStatus(
    submissionId,
    status,
    additionalData = {}
  ) {
    try {
      const submissionRef = db
        .collection(collections.BUSINESS_MANUAL_SUBMISSION)
        .doc(submissionId);
      const updatePayload = {
        status,
        ...additionalData,
        updatedAt: new Date(),
      };

      await submissionRef.update(updatePayload);
      return { success: true, data: updatePayload };
    } catch (error) {
      console.error("Error updating submission status:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Create business manual response
   */
  static async createManualResponse(responseData) {
    try {
      const responseRef = db
        .collection(collections.BUSINESS_MANUAL_RESPONSE)
        .doc();
      const response = {
        id: responseRef.id,
        ...responseData,
        status: "completed",
        generatedAt: new Date(),
        updatedAt: new Date(),
      };

      await responseRef.set(response);

      // Update the submission status to completed
      if (responseData.submissionId) {
        await this.updateSubmissionStatus(
          responseData.submissionId,
          "completed"
        );
      }

      return { success: true, data: response };
    } catch (error) {
      console.error("Error creating manual response:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Generate and store business manual response
   */
  static async generateAndStoreResponse(submissionData) {
    try {
      // Update submission status to processing
      await this.updateSubmissionStatus(submissionData.id, "processing");

      // Generate the business manual using Mistral AI
      const generationResult = await this.generateBusinessManual(
        submissionData
      );

      if (!generationResult.success) {
        await this.updateSubmissionStatus(submissionData.id, "failed", {
          error: generationResult.error,
        });
        return generationResult;
      }

      // Create the response record
      const responseData = {
        submissionId: submissionData.id,
        userId: submissionData.userId,
        businessName: submissionData.businessNiche,
        content: generationResult.data,
        generatedAt: new Date(),
        status: "completed",
      };

      const responseResult = await this.createManualResponse(responseData);

      if (!responseResult.success) {
        await this.updateSubmissionStatus(submissionData.id, "failed", {
          error: responseResult.error,
        });
        return responseResult;
      }

      return { success: true, data: responseResult.data };
    } catch (error) {
      console.error("Error generating and storing response:", error);
      await this.updateSubmissionStatus(submissionData.id, "failed", {
        error: error.message,
      });
      return { success: false, error: error.message };
    }
  }

  /**
   * Get business manual response by submission ID
   */
  static async getResponseBySubmissionId(submissionId) {
    try {
      const querySnapshot = await db
        .collection(collections.BUSINESS_MANUAL_RESPONSE)
        .where("submissionId", "==", submissionId)
        .limit(1)
        .get();

      if (querySnapshot.empty) {
        return { success: false, error: "Response not found" };
      }

      const responseData = querySnapshot.docs[0].data();
      return { success: true, data: responseData };
    } catch (error) {
      console.error("Error getting response:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get all responses for a user
   */
  static async getResponsesByUser(userId, limit = 10) {
    try {
      const querySnapshot = await db
        .collection(collections.BUSINESS_MANUAL_RESPONSE)
        .where("userId", "==", userId)
        .orderBy("generatedAt", "desc")
        .limit(limit)
        .get();

      const responses = querySnapshot.docs.map((doc) => doc.data());
      return { success: true, data: responses };
    } catch (error) {
      console.error("Error getting user responses:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get all pending submissions (for admin)
   */
  static async getPendingSubmissions(limit = 20) {
    try {
      const querySnapshot = await db
        .collection(collections.BUSINESS_MANUAL_SUBMISSION)
        .where("status", "in", ["submitted", "processing"])
        .orderBy("submittedAt", "asc")
        .limit(limit)
        .get();

      const submissions = querySnapshot.docs.map((doc) => doc.data());
      return { success: true, data: submissions };
    } catch (error) {
      console.error("Error getting pending submissions:", error);
      return { success: false, error: error.message };
    }
  }
}
