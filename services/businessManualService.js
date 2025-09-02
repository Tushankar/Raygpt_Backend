// import { db, collections } from "../config/firebase.js";
// import dotenv from "dotenv";
// import { GoogleGenerativeAI } from "@google/generative-ai";

// // Load environment variables
// dotenv.config();

// /**
//  * Advanced Gemini-Powered Business Manual Service
//  * Uses Google's Gemini 2.0 Flash Experimental model with sophisticated prompt engineering
//  */
// export class BusinessManualService {
//   constructor() {
//     // Initialize Google Generative AI
//     this.genAI = new GoogleGenerativeAI(process.env.GOOGLE_CLOUD_API_KEY);

//     // AI model configurations
//     this.models = {
//       analysis: {
//         name: "gemini-2.5-flash",
//         config: {
//           temperature: 0.2, // Lower for more precise business analysis
//           topK: 40,
//           topP: 0.95,
//           maxOutputTokens: 8192,
//           responseMimeType: "text/plain",
//         },
//       },
//     };
//   }
//   static async submitBusinessManual(submissionData) {
//     try {
//       const submissionRef = db
//         .collection(collections.BUSINESS_MANUAL_SUBMISSION)
//         .doc();
//       const submission = {
//         id: submissionRef.id,
//         ...submissionData,
//         status: "submitted",
//         submittedAt: new Date(),
//         updatedAt: new Date(),
//       };

//       await submissionRef.set(submission);
//       return { success: true, data: submission };
//     } catch (error) {
//       console.error("Error submitting business manual:", error);
//       return { success: false, error: error.message };
//     }
//   }

//   /**
//    * Generate business manual response using Google Gemini AI SDK
//    */
//   static async generateBusinessManual(submissionData) {
//     try {
//       const service = new BusinessManualService();
//       const prompt = service.buildBusinessManualPrompt(submissionData);

//       // Get the model
//       const model = service.genAI.getGenerativeModel({
//         model: service.models.analysis.name,
//         generationConfig: service.models.analysis.config,
//       });

//       // Generate content
//       const result = await model.generateContent(prompt);
//       const response = await result.response;
//       const generatedContent = response.text();

//       if (!generatedContent || generatedContent.trim().length === 0) {
//         throw new Error("Empty response from Gemini API");
//       }

//       return { success: true, data: generatedContent };
//     } catch (error) {
//       console.error("Error generating business manual:", error);

//       let errorMessage = "Failed to generate business manual";

//       if (error.message.includes("API_KEY")) {
//         errorMessage =
//           "Invalid API key. Please check your GOOGLE_CLOUD_API_KEY configuration.";
//       } else if (
//         error.message.includes("quota") ||
//         error.message.includes("rate")
//       ) {
//         errorMessage = "API rate limit exceeded. Please try again later.";
//       } else if (
//         error.message.includes("network") ||
//         error.message.includes("fetch")
//       ) {
//         errorMessage = "Network error. Please check your internet connection.";
//       } else if (error.message) {
//         errorMessage += `: ${error.message}`;
//       }

//       return { success: false, error: errorMessage };
//     }
//   }

//   /**
//    * Build the prompt for Gemini AI based on submission data
//    */
//   buildBusinessManualPrompt(submissionData) {
//     return `Generate a comprehensive business manual for the following business. The response should be structured as a complete business guide with detailed sections, similar to professional business consulting reports.

// Business Details:
// - Business Niche: ${submissionData.businessNiche || "Not specified"}
// - Location: ${submissionData.location || "Not specified"}
// - Store Type: ${submissionData.storeType || "Not specified"}
// - Business Stage: ${submissionData.businessStage || "Planning"}
// - Budget Range: $${submissionData.budgetRange?.[0] || 5000} - $${
//       submissionData.budgetRange?.[1] || 20000
//     }
// - Annual Revenue Goal: $${submissionData.annualRevenueGoal || 50000}
// - Brand Tone: ${submissionData.brandTone || "Professional"}
// - Target Age Group: ${submissionData.targetAgeGroup?.[0] || 25} - ${
//       submissionData.targetAgeGroup?.[1] || 45
//     } years
// - Weekly Time Allocation: ${submissionData.weeklyTimeAllocation || 40} hours
// - Experience Level: ${submissionData.experienceLevel || "Intermediate"}

// Please generate a detailed business manual with the following EXACT structure and formatting. Use markdown formatting with proper headings, subheadings, bullet points, and numbered lists. Make it comprehensive and actionable:

// # BUSINESS MANUAL: ${
//       submissionData.businessNiche || "Your Business"
//     } Setup Guide

// ## EXECUTIVE SUMMARY
// - Overview of the business concept and goals
// - Key objectives and success metrics
// - Summary of recommendations tailored to the business details above

// ## BUSINESS SETUP
// ### 1. Market Research and Analysis
// - Target market analysis for ${submissionData.location || "your location"}
// - Competitor analysis and positioning strategy
// - Customer persona development for ages ${
//       submissionData.targetAgeGroup?.[0] || 25
//     }-${submissionData.targetAgeGroup?.[1] || 45}

// ### 2. Business Plan Development
// - Executive summary and business objectives
// - SWOT analysis specific to ${submissionData.businessNiche || "your business"}
// - Service/product offerings and pricing strategy

// ### 3. Location and Setup
// - Location selection criteria for ${submissionData.location || "your area"}
// - Physical space requirements for ${
//       submissionData.storeType || "your business type"
//     }
// - Interior design recommendations matching ${
//       submissionData.brandTone || "professional"
//     } tone

// ### 4. Legal and Regulatory Compliance
// - Business registration requirements
// - Necessary licenses and permits for ${
//       submissionData.location || "your location"
//     }
// - Legal consultation recommendations

// ### 5. Financial Planning
// - Budget allocation within $${submissionData.budgetRange?.[0] || 5000} - $${
//       submissionData.budgetRange?.[1] || 20000
//     } range
// - Revenue streams to achieve $${submissionData.annualRevenueGoal || 50000} goal
// - Cash flow management strategies

// ## EQUIPMENT & INFRASTRUCTURE
// ### Office Space
// - Location recommendations in ${submissionData.location || "your area"}
// - Space requirements for ${submissionData.businessNiche || "your business"}
// - Layout and design considerations

// ### Technology Setup
// - Computer and hardware requirements
// - Software licenses and development tools
// - Networking and security infrastructure

// ### Furniture and Office Supplies
// - Ergonomic workspace setup
// - Meeting room and common area requirements
// - Budget breakdown for equipment

// ## HR & STAFFING
// ### Team Structure
// - Key roles and responsibilities for ${
//       submissionData.businessNiche || "your business"
//     }
// - Hiring strategy for ${
//       submissionData.experienceLevel || "intermediate"
//     } level team
// - Team size recommendations based on budget

// ### Recruitment Process
// - Job descriptions and requirements
// - Interview and selection process
// - Onboarding and training programs

// ### Compliance and Legal
// - Employment law compliance
// - Salary structures within budget constraints
// - Performance management systems

// ## FINANCIAL PLANNING
// ### Startup Costs Breakdown
// - One-time setup costs within $${submissionData.budgetRange?.[0] || 5000} - $${
//       submissionData.budgetRange?.[1] || 20000
//     }
// - Monthly operational expenses
// - Contingency fund allocation

// ### Revenue Projections
// - Pricing strategy for services
// - Sales forecasting to reach $${submissionData.annualRevenueGoal || 50000}
// - Break-even analysis

// ### Funding and Investment
// - Bootstrap strategies
// - Funding options for growth
// - Financial management tools

// ## INVENTORY & SUPPLY CHAIN
// ### Inventory Management
// - Inventory requirements for ${submissionData.businessNiche || "your business"}
// - Stock management systems
// - Supplier relationship management

// ### Supply Chain Setup
// - Vendor selection criteria
// - Procurement processes
// - Quality control measures

// ### Logistics and Operations
// - Order fulfillment processes
// - Inventory tracking systems
// - Cost optimization strategies

// ## MARKETING STRATEGY
// ### Target Audience Analysis
// - Detailed persona for ages ${submissionData.targetAgeGroup?.[0] || 25}-${
//       submissionData.targetAgeGroup?.[1] || 45
//     }
// - Customer journey mapping
// - Brand positioning strategy

// ### Marketing Channels
// - Digital marketing strategies
// - Local marketing approaches
// - Content marketing plan

// ### Budget Allocation
// - Marketing budget breakdown
// - Campaign planning and execution
// - Performance measurement

// ## COMPLIANCE & LEGAL
// ### Business Registration
// - Legal structure options
// - Registration process in ${submissionData.location || "your location"}
// - Required documentation

// ### Regulatory Compliance
// - Industry-specific regulations
// - Tax compliance requirements
// - Data protection and privacy laws

// ### Risk Management
// - Legal risk assessment
// - Insurance requirements
// - Compliance monitoring

// ## PARTNERSHIP & COMMUNITY
// ### Strategic Partnerships
// - Potential partners for ${submissionData.businessNiche || "your business"}
// - Partnership development strategy
// - Collaboration opportunities

// ### Community Engagement
// - Local community involvement
// - Networking strategies
// - Reputation building

// ### Affiliate Programs
// - Referral program setup
// - Influencer partnerships
// - Community ambassador programs

// ## SCALABILITY PLAN
// ### Growth Strategy
// - 12-month growth roadmap
// - Expansion opportunities
// - Market penetration strategies

// ### Operational Scaling
// - Team expansion planning
// - Process optimization
// - Technology scaling

// ### Financial Scaling
// - Investment requirements
// - Revenue scaling strategies
// - Exit strategies

// Make this manual highly personalized to the business details provided. Use the ${
//       submissionData.brandTone || "professional"
//     } tone throughout. Be specific with numbers, timelines, and actionable steps. Ensure all recommendations are realistic within the given budget range and align with the target audience and business stage.`;
//   }

//   /**
//    * Get business manual submission by ID
//    */
//   static async getSubmissionById(submissionId) {
//     try {
//       const submissionDoc = await db
//         .collection(collections.BUSINESS_MANUAL_SUBMISSION)
//         .doc(submissionId)
//         .get();

//       if (!submissionDoc.exists) {
//         return { success: false, error: "Submission not found" };
//       }

//       return { success: true, data: submissionDoc.data() };
//     } catch (error) {
//       console.error("Error getting submission:", error);
//       return { success: false, error: error.message };
//     }
//   }

//   /**
//    * Get all submissions for a user
//    */
//   static async getSubmissionsByUser(userId, limit = 10) {
//     try {
//       const querySnapshot = await db
//         .collection(collections.BUSINESS_MANUAL_SUBMISSION)
//         .where("userId", "==", userId)
//         .orderBy("submittedAt", "desc")
//         .limit(limit)
//         .get();

//       const submissions = querySnapshot.docs.map((doc) => doc.data());
//       return { success: true, data: submissions };
//     } catch (error) {
//       console.error("Error getting user submissions:", error);
//       return { success: false, error: error.message };
//     }
//   }

//   /**
//    * Update submission status
//    */
//   static async updateSubmissionStatus(
//     submissionId,
//     status,
//     additionalData = {}
//   ) {
//     try {
//       const submissionRef = db
//         .collection(collections.BUSINESS_MANUAL_SUBMISSION)
//         .doc(submissionId);
//       const updatePayload = {
//         status,
//         ...additionalData,
//         updatedAt: new Date(),
//       };

//       await submissionRef.update(updatePayload);
//       return { success: true, data: updatePayload };
//     } catch (error) {
//       console.error("Error updating submission status:", error);
//       return { success: false, error: error.message };
//     }
//   }

//   /**
//    * Create business manual response
//    */
//   static async createManualResponse(responseData) {
//     try {
//       const responseRef = db
//         .collection(collections.BUSINESS_MANUAL_RESPONSE)
//         .doc();
//       const response = {
//         id: responseRef.id,
//         ...responseData,
//         status: "completed",
//         generatedAt: new Date(),
//         updatedAt: new Date(),
//       };

//       await responseRef.set(response);

//       // Update the submission status to completed
//       if (responseData.submissionId) {
//         await this.updateSubmissionStatus(
//           responseData.submissionId,
//           "completed"
//         );
//       }

//       return { success: true, data: response };
//     } catch (error) {
//       console.error("Error creating manual response:", error);
//       return { success: false, error: error.message };
//     }
//   }

//   /**
//    * Generate and store business manual response
//    */
//   static async generateAndStoreResponse(submissionData) {
//     try {
//       // Update submission status to processing
//       await this.updateSubmissionStatus(submissionData.id, "processing");

//       // Generate the business manual using Mistral AI
//       const generationResult = await this.generateBusinessManual(
//         submissionData
//       );

//       if (!generationResult.success) {
//         await this.updateSubmissionStatus(submissionData.id, "failed", {
//           error: generationResult.error,
//         });
//         return generationResult;
//       }

//       // Create the response record
//       const responseData = {
//         submissionId: submissionData.id,
//         userId: submissionData.userId,
//         businessName: submissionData.businessNiche,
//         content: generationResult.data,
//         generatedAt: new Date(),
//         status: "completed",
//       };

//       const responseResult = await this.createManualResponse(responseData);

//       if (!responseResult.success) {
//         await this.updateSubmissionStatus(submissionData.id, "failed", {
//           error: responseResult.error,
//         });
//         return responseResult;
//       }

//       return { success: true, data: responseResult.data };
//     } catch (error) {
//       console.error("Error generating and storing response:", error);
//       await this.updateSubmissionStatus(submissionData.id, "failed", {
//         error: error.message,
//       });
//       return { success: false, error: error.message };
//     }
//   }

//   /**
//    * Get business manual response by submission ID
//    */
//   static async getResponseBySubmissionId(submissionId) {
//     try {
//       const querySnapshot = await db
//         .collection(collections.BUSINESS_MANUAL_RESPONSE)
//         .where("submissionId", "==", submissionId)
//         .limit(1)
//         .get();

//       if (querySnapshot.empty) {
//         return { success: false, error: "Response not found" };
//       }

//       const responseData = querySnapshot.docs[0].data();
//       return { success: true, data: responseData };
//     } catch (error) {
//       console.error("Error getting response:", error);
//       return { success: false, error: error.message };
//     }
//   }

//   /**
//    * Get all responses for a user
//    */
//   static async getResponsesByUser(userId, limit = 10) {
//     try {
//       const querySnapshot = await db
//         .collection(collections.BUSINESS_MANUAL_RESPONSE)
//         .where("userId", "==", userId)
//         .orderBy("generatedAt", "desc")
//         .limit(limit)
//         .get();

//       const responses = querySnapshot.docs.map((doc) => doc.data());
//       return { success: true, data: responses };
//     } catch (error) {
//       console.error("Error getting user responses:", error);
//       return { success: false, error: error.message };
//     }
//   }

//   /**
//    * Get all pending submissions (for admin)
//    */
//   static async getPendingSubmissions(limit = 20) {
//     try {
//       const querySnapshot = await db
//         .collection(collections.BUSINESS_MANUAL_SUBMISSION)
//         .where("status", "in", ["submitted", "processing"])
//         .orderBy("submittedAt", "asc")
//         .limit(limit)
//         .get();

//       const submissions = querySnapshot.docs.map((doc) => doc.data());
//       return { success: true, data: submissions };
//     } catch (error) {
//       console.error("Error getting pending submissions:", error);
//       return { success: false, error: error.message };
//     }
//   }
// }
// server/services/businessManualService.js (or similar path)
// server/services/businessManualService.js (or similar path)

import { db, collections } from "../config/firebase.js";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Load environment variables
dotenv.config();

/**
 * Advanced Gemini-Powered Business Manual Service
 * Uses Google's Gemini Pro model with structured JSON responses
 */
export class BusinessManualService {
  constructor() {
    // Check if API key is available
    if (!process.env.GOOGLE_CLOUD_API_KEY) {
      throw new Error(
        "GOOGLE_CLOUD_API_KEY is not configured in environment variables"
      );
    }

    console.log("✅ GOOGLE_CLOUD_API_KEY found, initializing Gemini AI...");

    // Initialize Google Generative AI
    this.genAI = new GoogleGenerativeAI(process.env.GOOGLE_CLOUD_API_KEY);

    // AI model configurations - optimized for better JSON generation
    this.models = {
      analysis: {
        name: "gemini-1.5-flash", // Using a stable, powerful model
        config: {
          temperature: 0.1, // Lower temperature for more consistent JSON
          topK: 20,
          topP: 0.8,
          maxOutputTokens: 16384, // Increased from 8192 to handle larger responses
          // responseMimeType: "application/json", // Removed to prevent empty responses
        },
      },
    };
  }

  /**
   * Advanced JSON cleaning and repair function
   */
  static cleanJsonString(jsonString) {
    try {
      console.log(
        "Starting JSON cleaning, original length:",
        jsonString.length
      );

      // Remove null bytes and control characters except for \n, \r, \t
      jsonString = jsonString.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");

      // Remove any text before the first { and after the last }
      const firstBrace = jsonString.indexOf("{");
      const lastBrace = jsonString.lastIndexOf("}");

      if (firstBrace === -1 || lastBrace === -1 || firstBrace >= lastBrace) {
        throw new Error("No valid JSON object found");
      }

      jsonString = jsonString.substring(firstBrace, lastBrace + 1);
      console.log("After brace extraction, length:", jsonString.length);

      // More aggressive JSON fixing
      jsonString = jsonString
        // Fix trailing commas before closing brackets/braces
        .replace(/,(\s*[}\]])/g, "$1")
        // Fix double quotes in string values - more specific pattern
        .replace(/: "([^"]*)"([^",\]}]*)"([^,\]}]*)/g, ': "$1\\"$2\\"$3"')
        // Fix incomplete property-value pairs
        .replace(/:\s*"[^"]*$/g, ': ""')
        // Remove incomplete trailing content after last complete object
        .replace(/[^"}]*$/, "")
        // Fix missing quotes around property names
        .replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":')
        // Fix escaped characters that might be causing issues
        .replace(/\\"/g, '\\"')
        // Remove any trailing incomplete strings or properties
        .replace(/,\s*$/, "")
        // Ensure we end with a proper closing brace
        .replace(/[^}]*$/, "}");

      // Try to balance braces properly
      const openBraces = (jsonString.match(/\{/g) || []).length;
      const closeBraces = (jsonString.match(/\}/g) || []).length;
      const missingBraces = openBraces - closeBraces;

      console.log(
        "Brace balance - open:",
        openBraces,
        "close:",
        closeBraces,
        "missing:",
        missingBraces
      );

      if (missingBraces > 0) {
        // Add missing closing braces
        for (let i = 0; i < missingBraces; i++) {
          jsonString += "}";
        }
      }

      console.log("After cleaning, final length:", jsonString.length);
      return jsonString;
    } catch (error) {
      console.error("Error in cleanJsonString:", error);
      return jsonString; // Return original if cleaning fails
    }
  }

  /**
   * Try to parse JSON with progressive truncation if it fails
   */
  static parseJsonProgressively(jsonString) {
    // First try normal parsing
    try {
      return JSON.parse(jsonString);
    } catch (firstError) {
      console.log("Initial JSON parse failed at position:", firstError.message);

      // If there's a position in the error, try truncating before that position
      const positionMatch = firstError.message.match(/position (\d+)/);
      if (positionMatch) {
        const errorPosition = parseInt(positionMatch[1]);
        console.log(
          "Attempting to truncate and repair at position:",
          errorPosition
        );

        // More sophisticated truncation and repair
        let truncatedJson = jsonString.substring(0, errorPosition);

        // Remove incomplete property or value
        const lastComma = truncatedJson.lastIndexOf(",");
        const lastBrace = truncatedJson.lastIndexOf("{");
        const lastQuote = truncatedJson.lastIndexOf('"');
        const lastColon = truncatedJson.lastIndexOf(":");

        // If we're in the middle of a property value, truncate to before the property
        if (lastColon > lastComma && lastColon > lastBrace) {
          // Find the start of the incomplete property
          let propStart = truncatedJson.lastIndexOf('"', lastColon - 1);
          if (propStart > lastComma) {
            propStart = truncatedJson.lastIndexOf('"', propStart - 1);
            if (propStart > lastComma) {
              truncatedJson = truncatedJson.substring(0, propStart);
            }
          }
        }

        // Clean up trailing characters that might cause issues
        truncatedJson = truncatedJson.replace(/,\s*$/, ""); // Remove trailing comma
        truncatedJson = truncatedJson.replace(/:\s*$/, ""); // Remove trailing colon
        truncatedJson = truncatedJson.replace(/"\s*$/, ""); // Remove incomplete quote

        // Ensure proper closing
        const openBraces = (truncatedJson.match(/\{/g) || []).length;
        const closeBraces = (truncatedJson.match(/\}/g) || []).length;
        const missingBraces = openBraces - closeBraces;

        for (let i = 0; i < missingBraces; i++) {
          truncatedJson += "}";
        }

        console.log(
          "Attempting to parse truncated JSON, length:",
          truncatedJson.length
        );

        try {
          return JSON.parse(truncatedJson);
        } catch (secondError) {
          console.log("Truncated JSON also failed:", secondError.message);

          // Last resort: try to extract what we can from the beginning
          const firstBrace = jsonString.indexOf("{");
          if (firstBrace !== -1) {
            let extractedContent = jsonString.substring(firstBrace);

            // Find the first complete section
            const patterns = [
              /"executiveSummary":\s*\{[^}]*\}/,
              /"kpiDashboard":\s*\{[^}]*\}/,
              /"businessSetup":\s*\{[^}]*\}/,
            ];

            for (const pattern of patterns) {
              const match = extractedContent.match(pattern);
              if (match) {
                try {
                  const testJson = `{${match[0]}}`;
                  return JSON.parse(testJson);
                } catch (e) {
                  continue;
                }
              }
            }
          }

          throw new Error(
            "Unable to parse JSON even after advanced repair attempts"
          );
        }
      }

      throw firstError;
    }
  }

  /**
   * Check if JSON structure is valid
   */
  static isValidJsonStructure(jsonString) {
    try {
      // Basic structure checks
      if (
        !jsonString.trim().startsWith("{") ||
        !jsonString.trim().endsWith("}")
      ) {
        return false;
      }

      // Check for balanced braces
      const openBraces = (jsonString.match(/\{/g) || []).length;
      const closeBraces = (jsonString.match(/\}/g) || []).length;

      if (openBraces !== closeBraces) {
        return false;
      }

      // Check for balanced brackets
      const openBrackets = (jsonString.match(/\[/g) || []).length;
      const closeBrackets = (jsonString.match(/\]/g) || []).length;

      if (openBrackets !== closeBrackets) {
        return false;
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Repair JSON structure issues
   */
  static repairJsonStructure(jsonString) {
    try {
      // Find the position where JSON becomes invalid
      let validUpTo = 0;
      let braceDepth = 0;
      let inString = false;
      let escapeNext = false;

      for (let i = 0; i < jsonString.length; i++) {
        const char = jsonString[i];

        if (escapeNext) {
          escapeNext = false;
          continue;
        }

        if (char === "\\" && inString) {
          escapeNext = true;
          continue;
        }

        if (char === '"' && !escapeNext) {
          inString = !inString;
          continue;
        }

        if (!inString) {
          if (char === "{") {
            braceDepth++;
          } else if (char === "}") {
            braceDepth--;
            if (braceDepth >= 0) {
              validUpTo = i;
            }
          }
        }

        // If we have invalid characters or structure, break
        if (braceDepth < 0) {
          break;
        }
      }

      // Truncate to last valid position
      if (validUpTo > 0) {
        jsonString = jsonString.substring(0, validUpTo + 1);
      }

      // Ensure proper closing
      while (braceDepth > 0) {
        jsonString += "}";
        braceDepth--;
      }

      return jsonString;
    } catch (error) {
      console.error("Error in repairJsonStructure:", error);
      return jsonString;
    }
  }

  /**
   * Analyze business context from submission data
   */
  analyzeBusinessContext(submissionData) {
    const businessNiche = (submissionData.businessNiche || "").toLowerCase();
    const storeType = submissionData.storeType || "";

    // Simple business type classification
    if (
      businessNiche.includes("restaurant") ||
      businessNiche.includes("food") ||
      businessNiche.includes("bakery")
    ) {
      return { type: "Restaurant/Food Service", confidence: "high" };
    } else if (
      businessNiche.includes("retail") ||
      businessNiche.includes("store") ||
      businessNiche.includes("shop")
    ) {
      return { type: "Retail", confidence: "high" };
    } else if (
      businessNiche.includes("consulting") ||
      businessNiche.includes("service") ||
      businessNiche.includes("agency")
    ) {
      return { type: "Service/Consulting", confidence: "high" };
    } else if (
      businessNiche.includes("tech") ||
      businessNiche.includes("software") ||
      businessNiche.includes("app")
    ) {
      return { type: "Technology", confidence: "high" };
    } else {
      return { type: "General Business", confidence: "medium" };
    }
  }

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
      return { success: true, data: submission, submission: submission };
    } catch (error) {
      console.error("Error submitting business manual:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Generate business manual response using Google Gemini AI SDK
   */
  static async generateBusinessManual(submissionData) {
    try {
      const service = new BusinessManualService();
      const prompt = service.buildAdvancedBusinessManualPrompt(submissionData);

      // Get the model
      const model = service.genAI.getGenerativeModel({
        model: service.models.analysis.name,
        generationConfig: service.models.analysis.config,
      });

      // Generate content
      const result = await model.generateContent(prompt);
      const response = await result.response;
      let generatedContent = response.text();

      if (!generatedContent || generatedContent.trim().length === 0) {
        throw new Error("Empty response from Gemini API");
      }

      // Log the full Gemini response for debugging
      console.log("\n🔍 FULL GEMINI RESPONSE:");
      console.log("=".repeat(80));
      console.log(generatedContent);
      console.log("=".repeat(80));
      console.log("Response length:", generatedContent.length, "characters\n");

      // Parse JSON response with improved error handling
      let parsedContent;
      try {
        // Clean any potential markdown formatting
        generatedContent = generatedContent
          .replace(/```json/g, "") // remove ```json fences
          .replace(/```/g, "") // remove plain ``` fences
          .trim();

        console.log("Original content length:", generatedContent.length);
        console.log("Content preview:", generatedContent.substring(0, 200));
        console.log(
          "Content ending:",
          generatedContent.substring(generatedContent.length - 200)
        );

        // Try to fix common JSON issues
        generatedContent =
          BusinessManualService.cleanJsonString(generatedContent);

        console.log("Cleaned content length:", generatedContent.length);
        console.log(
          "Cleaned content preview:",
          generatedContent.substring(0, 200)
        );
        console.log(
          "Cleaned content ending:",
          generatedContent.substring(generatedContent.length - 200)
        );

        // Use progressive JSON parsing
        parsedContent =
          BusinessManualService.parseJsonProgressively(generatedContent);
        console.log("✅ JSON parsed successfully with progressive method");
      } catch (parseError) {
        console.error(
          "❌ All JSON parsing methods failed:",
          parseError.message
        );
        console.log("Raw content length:", generatedContent.length);
        console.log(
          "Content preview (first 1000 chars):",
          generatedContent.substring(0, 1000)
        );
        console.log("Content around error position if available...");

        // Try one more fallback - create a minimal valid structure
        console.log("🔄 Attempting to create fallback structure...");

        try {
          // Extract whatever valid JSON we can find and create a minimal structure
          const basicStructure = {
            executiveSummary: {
              overview:
                "Business manual generation encountered parsing issues. Please regenerate for complete content.",
              keyObjectives: [
                "Establish business operations",
                "Achieve revenue targets",
                "Build market presence",
              ],
              criticalSuccessFactors: [
                "Customer satisfaction",
                "Financial management",
                "Operational efficiency",
              ],
              implementationTimeline:
                "12-month phased approach with quarterly milestones",
            },
            businessSetup: {
              marketResearch: {
                targetMarketAnalysis: `Comprehensive analysis of ${submissionData.businessNiche} market in ${submissionData.location} targeting ${submissionData.targetAgeGroup?.[0]}-${submissionData.targetAgeGroup?.[1]} year olds. Market size, growth trends, customer pain points, and demand patterns specific to the local area.`,
                competitorLandscape: `Detailed competitive analysis including direct and indirect competitors in ${submissionData.location}. Competitor strengths, weaknesses, pricing strategies, and market positioning gaps for ${submissionData.businessNiche}.`,
                customerPersona: `Primary customer persona including demographics (age ${submissionData.targetAgeGroup?.[0]}-${submissionData.targetAgeGroup?.[1]}), psychographics, buying behavior, income levels, digital habits, and specific needs for ${submissionData.businessNiche} services.`,
                marketPositioning: `Strategic positioning statement and unique value proposition for ${submissionData.businessNiche} business with competitive differentiation and brand promise.`,
              },
              businessPlan: {
                executiveSummary: `Mission statement, vision, and core objectives for ${submissionData.businessNiche} business targeting $${submissionData.annualRevenueGoal} annual revenue goal.`,
                swotAnalysis: {
                  strengths: [
                    `Local market knowledge in ${submissionData.location}`,
                    `Targeted focus on ${submissionData.businessNiche}`,
                    `${submissionData.brandTone} brand approach`,
                  ],
                  weaknesses: [
                    `New brand with limited recognition`,
                    `Limited initial capital ($${submissionData.budgetRange?.[0]}-$${submissionData.budgetRange?.[1]})`,
                  ],
                  opportunities: [
                    `Growing demand for ${submissionData.businessNiche}`,
                    `Underserved ${submissionData.targetAgeGroup?.[0]}-${submissionData.targetAgeGroup?.[1]} demographic`,
                    `Digital transformation trends`,
                  ],
                  threats: [
                    `Established competitors`,
                    `Economic uncertainty`,
                    `Changing consumer preferences`,
                  ],
                },
                serviceOfferings: `Core service portfolio for ${submissionData.businessNiche} including primary services, pricing strategy, delivery methods, and customer value propositions.`,
              },
              locationSetup: {
                siteSelectionCriteria: `Location analysis for ${submissionData.storeType} ${submissionData.businessNiche} business in ${submissionData.location} including foot traffic, accessibility, competition proximity, and lease terms.`,
                physicalSpaceRequirements: `Space planning for ${submissionData.storeType} operation including square footage needs, layout design, customer flow, storage areas, and compliance requirements.`,
                leaseNegotiation: `Commercial lease negotiation strategy including term length, rent escalation, improvement allowances, and exit clauses for ${submissionData.location} market.`,
              },
              equipmentInfrastructure: {
                technologyStack: {
                  essential: `Core technology requirements for ${
                    submissionData.businessNiche
                  } including computers, software licenses, internet infrastructure, and basic automation tools. Essential setup cost: $${Math.round(
                    (submissionData.budgetRange?.[1] || 20000) * 0.15
                  )}.`,
                  optimal: `Enhanced technology setup including advanced software, cloud services, customer management systems, and productivity tools for improved efficiency. Additional investment: $${Math.round(
                    (submissionData.budgetRange?.[1] || 20000) * 0.1
                  )}.`,
                  premium: `Premium technology infrastructure including AI tools, advanced analytics, enterprise software, and cutting-edge equipment for competitive advantage. Premium upgrade: $${Math.round(
                    (submissionData.budgetRange?.[1] || 20000) * 0.15
                  )}.`,
                  budgetBreakdown: `Technology investment strategy across essential (${Math.round(
                    15
                  )}%), optimal (${Math.round(10)}%), and premium (${Math.round(
                    15
                  )}%) tiers with vendor recommendations and implementation timeline.`,
                },
                physicalAssets: {
                  essential: `Basic physical assets for ${submissionData.businessNiche} operation including furniture, equipment, tools, and safety items. Cost breakdown and supplier recommendations for ${submissionData.location}.`,
                  optimal: `Enhanced physical setup including upgraded furniture, professional equipment, customer comfort items, and operational efficiency tools. Value-added investments for improved customer experience.`,
                  premium: `Premium physical assets including luxury furnishings, state-of-the-art equipment, advanced security systems, and premium customer amenities for market differentiation.`,
                  budgetBreakdown: `Physical asset investment plan with essential baseline, optimal enhancements, and premium upgrades. Vendor sourcing and financing options for ${submissionData.location}.`,
                },
              },
            },
            hrStaffing: {
              organizationalChart: {
                day1: `Initial team structure for ${submissionData.businessNiche} startup including founder role, first hire position, role responsibilities, and decision-making hierarchy.`,
                month6: `6-month expansion plan including 2-3 additional hires, department creation, and team coordination processes.`,
                year2: `Full organizational growth structure with department heads, management layers, and scalable hierarchy for ${submissionData.businessNiche} business.`,
              },
              keyRoles: {
                jobScorecards: `Complete job scorecards for first 3 critical hires including Operations Manager, Sales/Customer Success, and Marketing Coordinator with specific KPIs and competencies.`,
                competencyRequirements: `Detailed skills matrix including technical skills, soft skills, industry experience, and cultural fit criteria for each role in ${submissionData.businessNiche}.`,
              },
              talentAcquisition: {
                sourcingStrategy: `Talent sourcing plan for ${submissionData.location} including local job boards, networking events, and referral programs.`,
                interviewProcess: `4-stage interview process with phone screening, skills assessment, cultural fit interview, and final decision meeting.`,
                onboardingProgram: `90-day onboarding plan including orientation, training modules, goal setting, and performance reviews.`,
              },
              compensationCulture: {
                salaryStrategy: `Compensation framework including base salary ranges within $${submissionData.budgetRange?.[0]}-$${submissionData.budgetRange?.[1]} budget, performance bonuses, and benefits package.`,
                culturePrinciples: [
                  "Customer-first mindset",
                  "Continuous learning culture",
                  "Transparent communication",
                  "Results-oriented performance",
                  "Work-life balance",
                ],
              },
            },
            financialPlanning: {
              capitalRequirements: {
                capexBreakdown: `Detailed capital expenditures from $${submissionData.budgetRange?.[0]}-$${submissionData.budgetRange?.[1]} budget including equipment, inventory, legal fees, marketing, and working capital.`,
                opexBreakdown: `Monthly operational expenses including rent, insurance, marketing, salaries, software subscriptions, and professional services.`,
                contingencyFund: `Emergency fund allocation of 15-20% of total budget for unexpected expenses and opportunities.`,
              },
              financialProjections: {
                pessimistic: {
                  revenue: `Worst-case scenario with conservative revenue projections and market challenges.`,
                  expenses: `Conservative expense forecast with higher costs and delayed revenue recognition.`,
                  breakeven: `Break-even analysis showing extended timeline with cash flow considerations.`,
                },
                realistic: {
                  revenue: `Expected revenue progression to achieve $${submissionData.annualRevenueGoal} annual goal.`,
                  expenses: `Realistic expense forecast with quarterly reviews and optimization.`,
                  breakeven: `Expected break-even timing with sustainable growth metrics.`,
                },
                optimistic: {
                  revenue: `Best-case scenario with accelerated growth and market leadership opportunities.`,
                  expenses: `Optimistic expense management with economies of scale.`,
                  breakeven: `Accelerated break-even with rapid profitability and expansion funding.`,
                },
              },
              fundingStrategy: {
                bootstrapping: `Self-funding analysis including pros, cons, and growth limitations for ${submissionData.businessNiche}.`,
                debtFinancing: `SBA loans, bank financing, and alternative lending options for ${submissionData.location}.`,
                equityInvestment: `Angel investor and VC considerations including valuation and equity dilution scenarios.`,
              },
              cashFlowTactics: [
                "Implement net-30 payment terms with early payment discounts",
                "Negotiate extended payment terms with suppliers",
                "Establish business line of credit for cash flow management",
                "Create subscription or retainer models for predictable revenue",
              ],
            },
            inventorySupply: {
              applicable: [
                "retail",
                "restaurant",
                "physical",
                "hybrid",
              ].includes(submissionData.storeType),
              supplierVetting: {
                scoringCriteria: `Supplier evaluation matrix including cost, quality, reliability, payment terms, and geographic proximity.`,
                primarySuppliers: `Strategic supplier selection for ${submissionData.businessNiche} with contact information and pricing structures.`,
                backupSuppliers: `Risk mitigation through secondary supplier relationships and alternative sourcing strategies.`,
              },
              inventoryOptimization: {
                managementStrategy: `Inventory management strategy with turnover targets and demand forecasting for ${submissionData.businessNiche}.`,
                initialOrders: `Starting inventory investment plan with fast-moving, medium-velocity, and specialty items allocation.`,
                reorderPoints: `Automated inventory triggers with minimum stock levels and reorder quantities.`,
              },
              logisticsStrategy: {
                receivingProcess: `Comprehensive goods receipt procedure with quality inspection and inventory updates.`,
                fulfillmentProcess: `Order processing workflow from customer order to delivery with carrier selection.`,
                returnsManagement: `Customer return policy with 30-day window and refund processing procedures.`,
              },
            },
            marketingStrategy: {
              brandPositioning: {
                positioningStatement: `Strategic positioning for ${submissionData.businessNiche} targeting ${submissionData.targetAgeGroup?.[0]}-${submissionData.targetAgeGroup?.[1]} year olds in ${submissionData.location}. Focus on unique value proposition and competitive differentiation.`,
                brandIdentity: `Comprehensive brand framework with ${submissionData.brandTone} tone, including voice guidelines, visual identity, and messaging strategy for ${submissionData.businessNiche} business.`,
              },
              customerAcquisitionFunnel: {
                awareness: {
                  localSEO: `Local search optimization for ${submissionData.location} including Google My Business, keyword targeting, and review management.`,
                  socialMediaAds: `Platform-specific advertising for Facebook, Instagram, and LinkedIn targeting ${submissionData.targetAgeGroup?.[0]}-${submissionData.targetAgeGroup?.[1]} demographics.`,
                  publicRelations: `PR strategy including local media outreach, community events, and thought leadership for ${submissionData.businessNiche}.`,
                },
                interest: {
                  contentMarketing: `Content strategy with blog posts, videos, and educational resources relevant to ${submissionData.businessNiche}.`,
                  leadMagnets: `Free resources and consultations to capture leads and demonstrate expertise.`,
                },
                desire: {
                  testimonials: `Customer testimonial collection and display system across all marketing channels.`,
                  caseStudies: `Success story development with metrics and outcomes for credibility building.`,
                  emailNurturing: `Automated email sequences for lead nurturing and customer retention.`,
                },
                action: {
                  launchOffers: `Grand opening promotions and limited-time offers to drive initial sales.`,
                  callsToAction: `Clear CTAs across all touchpoints with A/B testing optimization.`,
                },
              },
              launchBudget: {
                budgetAllocation: `Marketing budget breakdown from $${Math.round(
                  (submissionData.budgetRange?.[1] || 20000) * 0.2
                )} allocation across digital ads, content creation, and PR.`,
                weeklyTimeline: `12-week launch campaign with specific milestones and deliverables.`,
                performanceTracking: `KPI dashboard tracking leads, conversions, and ROI across all channels.`,
              },
            },
            complianceLegal: {
              businessRegistration: {
                legalStructure: `LLC recommendation for ${submissionData.businessNiche} in ${submissionData.location} with analysis of benefits and requirements.`,
                registrationProcess: `Step-by-step business registration including forms, fees, and timeline for ${submissionData.location}.`,
                requiredDocumentation: `Complete checklist of legal documents, licenses, and permits needed for operation.`,
              },
              regulatoryCompliance: {
                industryRegulations: `Federal, state, and local regulations specific to ${submissionData.businessNiche} businesses.`,
                taxRequirements: `Tax obligations including income, sales, and employment taxes with filing schedules.`,
                dataProtection: `Privacy compliance including GDPR, CCPA, and data security requirements.`,
              },
              riskManagement: {
                legalRiskAssessment: `Comprehensive risk analysis including liability, employment, and contract risks.`,
                insuranceRequirements: `Essential insurance coverage including general liability, professional, and property insurance.`,
                complianceMonitoring: `Ongoing compliance tracking and legal requirement updates.`,
              },
            },
            partnershipCommunity: {
              strategicAlliances: {
                partnershipTypes: `Strategic partnerships including suppliers, referral partners, and joint ventures for ${submissionData.businessNiche}.`,
                partnershipStrategy: `Systematic approach to identify and develop partnerships in ${submissionData.location}.`,
                mutualBenefits: `Value creation framework including revenue sharing and cost savings opportunities.`,
              },
              localIntegration: {
                communityInitiatives: `Community engagement strategy including charity involvement and local events.`,
                localSponsorship: `Sponsorship program for local events and organizations with ROI measurement.`,
                networkingStrategy: `Business networking approach including Chamber of Commerce and industry associations.`,
              },
              customerFeedback: {
                npsSystem: `Net Promoter Score implementation with survey design and action plans.`,
                feedbackCollection: `Multi-channel feedback system including surveys and social media monitoring.`,
                loyaltyProgram: `Customer retention program with points system and rewards structure.`,
              },
            },
            scalabilityPlan: {
              phasedGrowth: {
                year1: `Foundation phase with customer acquisition and operational establishment targets.`,
                year2: `Expansion phase with service line growth and team scaling objectives.`,
                year3: `Market leadership phase with brand establishment and strategic partnerships.`,
              },
              scalingTriggers: {
                revenueThresholds: `Revenue milestones indicating readiness for expansion phases.`,
                customerMilestones: `Customer count and satisfaction metrics for scaling decisions.`,
                marketIndicators: `Market conditions supporting growth including industry trends.`,
              },
              operationalBottlenecks: `Identification of capacity constraints and solutions for staff, technology, and processes.`,
              exitStrategies: {
                acquisition: `Strategic positioning for potential acquisition with valuation approach.`,
                managementBuyout: `Framework for management team acquisition with financing structure.`,
                lifestyleBusiness: `Sustainable business approach with passive income generation.`,
              },
            },
          };

          parsedContent = basicStructure;
          console.log("✅ Created fallback structure successfully");
        } catch (fallbackError) {
          console.error(
            "❌ Even fallback structure creation failed:",
            fallbackError
          );
          throw new Error(
            "Unable to parse or create valid business manual structure"
          );
        }
      }

      // Validate required structure and add missing sections
      if (!parsedContent || typeof parsedContent !== "object") {
        throw new Error("Invalid response structure received");
      }

      // Ensure all critical sections are present
      const requiredSections = [
        "businessSetup",
        "equipmentInfrastructure",
        "hrStaffing",
        "financialPlanning",
        "inventorySupply",
        "marketingStrategy",
        "complianceLegal",
        "partnershipCommunity",
        "scalabilityPlan",
      ];
      const missingSections = [];

      requiredSections.forEach((section) => {
        if (
          !parsedContent[section] ||
          typeof parsedContent[section] !== "object"
        ) {
          missingSections.push(section);
        }
      });

      if (missingSections.length > 0) {
        console.log("⚠️ Missing sections detected:", missingSections);

        // Add minimal structure for missing sections
        missingSections.forEach((section) => {
          switch (section) {
            case "businessSetup":
              parsedContent.businessSetup = {
                marketResearch: {
                  targetMarketAnalysis: `Comprehensive analysis of ${submissionData.businessNiche} market in ${submissionData.location} targeting ${submissionData.targetAgeGroup?.[0]}-${submissionData.targetAgeGroup?.[1]} year olds. Market size, growth trends, customer pain points, and demand patterns specific to the local area.`,
                  competitorLandscape: `Detailed competitive analysis including direct and indirect competitors in ${submissionData.location}. Competitor strengths, weaknesses, pricing strategies, and market positioning gaps for ${submissionData.businessNiche}.`,
                  customerPersona: `Primary customer persona including demographics (age ${submissionData.targetAgeGroup?.[0]}-${submissionData.targetAgeGroup?.[1]}), psychographics, buying behavior, income levels, digital habits, and specific needs for ${submissionData.businessNiche} services.`,
                  marketPositioning: `Strategic positioning statement and unique value proposition for ${submissionData.businessNiche} business with competitive differentiation and brand promise.`,
                },
                businessPlan: {
                  executiveSummary: `Mission statement, vision, and core objectives for ${submissionData.businessNiche} business targeting $${submissionData.annualRevenueGoal} annual revenue goal.`,
                  swotAnalysis: {
                    strengths: [
                      `Local market knowledge in ${submissionData.location}`,
                      `Targeted focus on ${submissionData.businessNiche}`,
                      `${submissionData.brandTone} brand approach`,
                    ],
                    weaknesses: [
                      `New brand with limited recognition`,
                      `Limited initial capital ($${submissionData.budgetRange?.[0]}-$${submissionData.budgetRange?.[1]})`,
                    ],
                    opportunities: [
                      `Growing demand for ${submissionData.businessNiche}`,
                      `Underserved ${submissionData.targetAgeGroup?.[0]}-${submissionData.targetAgeGroup?.[1]} demographic`,
                      `Digital transformation trends`,
                    ],
                    threats: [
                      `Established competitors`,
                      `Economic uncertainty`,
                      `Changing consumer preferences`,
                    ],
                  },
                  serviceOfferings: `Core service portfolio for ${submissionData.businessNiche} including primary services, pricing strategy, delivery methods, and customer value propositions.`,
                },
                locationSetup: {
                  siteSelectionCriteria: `Location analysis for ${submissionData.storeType} ${submissionData.businessNiche} business in ${submissionData.location} including foot traffic, accessibility, competition proximity, and lease terms.`,
                  physicalSpaceRequirements: `Space planning for ${submissionData.storeType} operation including square footage needs, layout design, customer flow, storage areas, and compliance requirements.`,
                  leaseNegotiation: `Commercial lease negotiation strategy including term length, rent escalation, improvement allowances, and exit clauses for ${submissionData.location} market.`,
                },
                equipmentInfrastructure: {
                  technologyStack: {
                    essential: `Core technology requirements for ${
                      submissionData.businessNiche
                    } including computers, software licenses, internet infrastructure, and basic automation tools. Essential setup cost: $${Math.round(
                      (submissionData.budgetRange?.[1] || 20000) * 0.15
                    )}.`,
                    optimal: `Enhanced technology setup including advanced software, cloud services, customer management systems, and productivity tools for improved efficiency. Additional investment: $${Math.round(
                      (submissionData.budgetRange?.[1] || 20000) * 0.1
                    )}.`,
                    premium: `Premium technology infrastructure including AI tools, advanced analytics, enterprise software, and cutting-edge equipment for competitive advantage. Premium upgrade: $${Math.round(
                      (submissionData.budgetRange?.[1] || 20000) * 0.15
                    )}.`,
                    budgetBreakdown: `Technology investment strategy across essential (15%), optimal (10%), and premium (15%) tiers with vendor recommendations and implementation timeline.`,
                  },
                  physicalAssets: {
                    essential: `Basic physical assets for ${submissionData.businessNiche} operation including furniture, equipment, tools, and safety items. Cost breakdown and supplier recommendations for ${submissionData.location}.`,
                    optimal: `Enhanced physical setup including upgraded furniture, professional equipment, customer comfort items, and operational efficiency tools. Value-added investments for improved customer experience.`,
                    premium: `Premium physical assets including luxury furnishings, state-of-the-art equipment, advanced security systems, and premium customer amenities for market differentiation.`,
                    budgetBreakdown: `Physical asset investment plan with essential baseline, optimal enhancements, and premium upgrades. Vendor sourcing and financing options for ${submissionData.location}.`,
                  },
                },
              };
              break;
            case "equipmentInfrastructure":
              parsedContent.equipmentInfrastructure = {
                technologyStack: {
                  essential: `Core technology requirements for ${
                    submissionData.businessNiche
                  } including computers, software licenses, internet infrastructure, and basic automation tools. Essential setup cost: $${Math.round(
                    (submissionData.budgetRange?.[1] || 20000) * 0.15
                  )}.`,
                  optimal: `Enhanced technology setup including advanced software, cloud services, customer management systems, and productivity tools for improved efficiency. Additional investment: $${Math.round(
                    (submissionData.budgetRange?.[1] || 20000) * 0.1
                  )}.`,
                  premium: `Premium technology infrastructure including AI tools, advanced analytics, enterprise software, and cutting-edge equipment for competitive advantage. Premium upgrade: $${Math.round(
                    (submissionData.budgetRange?.[1] || 20000) * 0.15
                  )}.`,
                  budgetBreakdown: `Technology investment strategy across essential (${Math.round(
                    15
                  )}%), optimal (${Math.round(10)}%), and premium (${Math.round(
                    15
                  )}%) tiers with vendor recommendations and implementation timeline.`,
                },
                physicalAssets: {
                  essential: `Basic physical assets for ${submissionData.businessNiche} operation including furniture, equipment, tools, and safety items. Cost breakdown and supplier recommendations for ${submissionData.location}.`,
                  optimal: `Enhanced physical setup including upgraded furniture, professional equipment, customer comfort items, and operational efficiency tools. Value-added investments for improved customer experience.`,
                  premium: `Premium physical assets including luxury furnishings, state-of-the-art equipment, advanced security systems, and premium customer amenities for market differentiation.`,
                  budgetBreakdown: `Physical asset investment plan with essential baseline, optimal enhancements, and premium upgrades. Vendor sourcing and financing options for ${submissionData.location}.`,
                },
              };
              break;
            case "hrStaffing":
              parsedContent.hrStaffing = {
                organizationalChart: {
                  day1: `Initial team structure for ${submissionData.businessNiche} startup including founder role, first hire position (customer service/operations assistant), role responsibilities, reporting structure, and decision-making hierarchy`,
                  month6: `6-month expansion plan including 2-3 additional hires, department creation, management layers, role specialization, team coordination processes, and growth-stage organizational structure`,
                  year2: `Full organizational growth structure with department heads, middle management, specialized roles, cross-functional teams, performance management systems, and scalable hierarchy for ${submissionData.businessNiche} business`,
                },
                keyRoles: {
                  jobScorecards: `Complete job scorecards for first 3 critical hires including: (1) Operations Manager - mission, 5 key outcomes, 10 measurable KPIs, required competencies; (2) Sales/Customer Success - mission, outcomes, KPIs, skills; (3) Marketing Coordinator - detailed scorecard with specific metrics and responsibilities`,
                  competencyRequirements: `Detailed skills matrix including technical skills, soft skills, industry experience, education requirements, certifications needed, personality traits, and cultural fit criteria for each role in ${submissionData.businessNiche}`,
                },
                talentAcquisition: {
                  sourcingStrategy: `Specific talent sourcing plan for ${submissionData.location} including local job boards (Indeed, LinkedIn, ZipRecruiter), industry-specific platforms, networking events, referral program design, headhunter contacts, university partnerships, and budget allocation per channel`,
                  interviewProcess: `Complete 4-stage interview process: (1) Phone screening with specific questions, (2) Skills assessment with practical tests, (3) Cultural fit interview with behavioral questions, (4) Final decision meeting with reference checks and salary negotiation framework`,
                  onboardingProgram: `Comprehensive 90-day onboarding plan including Day 1 orientation checklist, Week 1 training modules, Month 1 goal setting, Month 2 skill development, Month 3 performance review, mentorship assignment, and cultural integration activities`,
                },
                compensationCulture: {
                  salaryStrategy: `Detailed compensation framework including base salary ranges for each role (within $${submissionData.budgetRange?.[0]}-$${submissionData.budgetRange?.[1]} budget), performance bonuses (5-15% of base), equity/profit sharing options, benefits package, and annual review process`,
                  culturePrinciples: [
                    "Customer-first mindset with specific behaviors and practices",
                    "Continuous learning and professional development culture",
                    "Transparent communication and regular feedback loops",
                    "Results-oriented performance with measurable outcomes",
                    "Work-life balance with flexible scheduling options",
                  ],
                },
              };
              break;
            case "financialPlanning":
              parsedContent.financialPlanning = {
                capitalRequirements: {
                  capexBreakdown: `Detailed one-time capital expenditures from $${
                    submissionData.budgetRange?.[0]
                  }-$${
                    submissionData.budgetRange?.[1]
                  } budget including: Equipment/Technology ($${Math.round(
                    (submissionData.budgetRange?.[1] || 20000) * 0.3
                  )}), Initial Inventory ($${Math.round(
                    (submissionData.budgetRange?.[1] || 20000) * 0.2
                  )}), Legal/Professional fees ($${Math.round(
                    (submissionData.budgetRange?.[1] || 20000) * 0.1
                  )}), Marketing launch ($${Math.round(
                    (submissionData.budgetRange?.[1] || 20000) * 0.2
                  )}), Working capital ($${Math.round(
                    (submissionData.budgetRange?.[1] || 20000) * 0.2
                  )}), with specific vendor quotes and timing`,
                  opexBreakdown: `Monthly operational expenses breakdown including: Rent/Utilities ($${Math.round(
                    ((submissionData.budgetRange?.[1] || 20000) * 0.15) / 12
                  )}), Insurance ($${Math.round(
                    ((submissionData.budgetRange?.[1] || 20000) * 0.05) / 12
                  )}), Marketing ($${Math.round(
                    ((submissionData.budgetRange?.[1] || 20000) * 0.2) / 12
                  )}), Salaries ($${Math.round(
                    ((submissionData.budgetRange?.[1] || 20000) * 0.4) / 12
                  )}), Software subscriptions ($${Math.round(
                    ((submissionData.budgetRange?.[1] || 20000) * 0.1) / 12
                  )}), Professional services ($${Math.round(
                    ((submissionData.budgetRange?.[1] || 20000) * 0.05) / 12
                  )}), Miscellaneous ($${Math.round(
                    ((submissionData.budgetRange?.[1] || 20000) * 0.05) / 12
                  )}) - total monthly burn rate calculation`,
                  contingencyFund: `Emergency fund allocation of 15-20% of total budget ($${Math.round(
                    (submissionData.budgetRange?.[1] || 20000) * 0.15
                  )}) for unexpected expenses, market downturns, equipment failures, legal issues, or opportunity investments with specific access criteria and replenishment strategy`,
                },
                financialProjections: {
                  pessimistic: {
                    revenue: `24-month worst-case scenario with monthly revenue projections starting at $${Math.round(
                      (submissionData.annualRevenueGoal || 50000) * 0.04
                    )} Month 1, scaling to $${Math.round(
                      (submissionData.annualRevenueGoal || 50000) * 0.08
                    )} by Month 24, including seasonal variations and market challenges`,
                    expenses: `Conservative expense forecast with 20% higher costs, delayed revenue recognition, extended customer acquisition periods, and market penetration challenges`,
                    breakeven: `Break-even analysis showing ${Math.ceil(
                      18
                    )} months to profitability in pessimistic scenario with cash flow timing and funding requirements`,
                  },
                  realistic: {
                    revenue: `24-month expected revenue projection with monthly targets from $${Math.round(
                      (submissionData.annualRevenueGoal || 50000) * 0.06
                    )} Month 1 to $${Math.round(
                      (submissionData.annualRevenueGoal || 50000) / 12
                    )} by Month 12, continuing to $${Math.round(
                      ((submissionData.annualRevenueGoal || 50000) * 1.5) / 12
                    )} Month 24, based on market research and competitor analysis`,
                    expenses: `Realistic expense forecast with detailed monthly breakdown, staff additions timeline, marketing spend optimization, and operational scaling costs with quarterly reviews`,
                    breakeven: `Expected break-even at Month ${Math.ceil(
                      12
                    )} with positive cash flow, sustainable growth metrics, and reinvestment strategy for continued expansion`,
                  },
                  optimistic: {
                    revenue: `24-month best-case projection with accelerated growth from $${Math.round(
                      (submissionData.annualRevenueGoal || 50000) / 12
                    )} Month 1 to $${Math.round(
                      ((submissionData.annualRevenueGoal || 50000) * 2) / 12
                    )} by Month 12, reaching $${Math.round(
                      ((submissionData.annualRevenueGoal || 50000) * 3) / 12
                    )} Month 24 through market leadership and expansion opportunities`,
                    expenses: `Optimistic expense management with economies of scale, efficient operations, strategic partnerships reducing costs, and aggressive but sustainable growth investments`,
                    breakeven: `Accelerated break-even at Month ${Math.floor(
                      8
                    )} with rapid profitability, reinvestment opportunities, and expansion funding for market dominance`,
                  },
                },
                fundingStrategy: {
                  bootstrapping: `Self-funding analysis for ${submissionData.businessNiche} including pros (complete control, no debt, organic growth), cons (limited capital, slower expansion, personal risk), cash flow management, and growth limitations with specific recommendations`,
                  debtFinancing: `SBA loan options, traditional bank financing, equipment financing, and alternative lending with specific lenders, qualification requirements, terms, and application process for ${submissionData.location}`,
                  equityInvestment: `Angel investor and VC considerations including valuation expectations, equity dilution scenarios, investor selection criteria, pitch deck requirements, and exit strategy alignment for ${submissionData.businessNiche} industry`,
                },
                cashFlowTactics: [
                  "Implement net-30 payment terms with 2% early payment discounts to accelerate receivables",
                  "Negotiate net-60 payment terms with suppliers to extend payables and improve cash flow timing",
                  `Establish business line of credit ($${Math.round(
                    (submissionData.budgetRange?.[1] || 20000) * 0.5
                  )}) for seasonal fluctuations and opportunity investments`,
                  "Create invoice factoring relationships for immediate cash conversion during growth phases",
                  "Implement subscription or retainer models to ensure predictable monthly recurring revenue streams",
                ],
              };
              break;
            case "inventorySupply":
              const isApplicable = [
                "retail",
                "restaurant",
                "physical",
                "hybrid",
              ].includes(submissionData.storeType);
              parsedContent.inventorySupply = {
                applicable: isApplicable,
                supplierVetting: {
                  scoringCriteria: `Comprehensive supplier evaluation matrix including: Cost competitiveness (25% weight), Quality standards and certifications (25%), Reliability and on-time delivery (20%), Payment terms and flexibility (15%), Geographic proximity and shipping costs (10%), Customer service responsiveness (5%) with specific scoring methodology 1-10 scale`,
                  primarySuppliers: `Strategic primary supplier selection for ${submissionData.businessNiche} including: 3-5 main suppliers with contact information, product categories, pricing structures, minimum order quantities, lead times, quality certifications, and relationship management protocols`,
                  backupSuppliers: `Risk mitigation through secondary supplier relationships including: 2-3 backup suppliers per critical category, alternative sourcing strategies, emergency procurement procedures, and supplier diversification to prevent supply chain disruptions`,
                },
                inventoryOptimization: {
                  managementStrategy: `${
                    isApplicable
                      ? "Just-in-Time inventory management for efficient stock turnover"
                      : "Digital asset and service inventory management"
                  } strategy including inventory turnover targets, stock level optimization, and demand forecasting methodology`,
                  initialOrders: `Starting inventory investment plan allocating $${Math.round(
                    (submissionData.budgetRange?.[0] || 10000) * 0.3
                  )} from startup budget including: Fast-moving items (60% of budget), Medium-velocity products (30%), Slow-moving specialty items (10%) with specific product categories and quantities`,
                  reorderPoints: `Automated inventory triggers including: Minimum stock levels (2-4 weeks supply), reorder quantities (4-8 weeks supply), seasonal adjustment factors, lead time buffers, and inventory management software recommendations (TradeGecko, Cin7, or Zoho Inventory)`,
                },
                logisticsStrategy: {
                  receivingProcess: `Comprehensive goods receipt procedure including: Delivery scheduling and receiving hours, quality inspection checklist, damage reporting protocols, inventory system updates, vendor invoice matching, and storage procedures with staff training requirements`,
                  fulfillmentProcess: `Order processing workflow from customer order to delivery including: Order verification, picking procedures, packing standards, shipping carrier selection (UPS, FedEx, USPS), tracking implementation, and customer communication protocols with timing standards`,
                  returnsManagement: `Customer return policy and processing including: 30-day return window, condition requirements, restocking procedures, refund processing timeline (5-7 business days), return shipping arrangements, and inventory disposition (resale, disposal, warranty claims)`,
                },
              };
              break;
            case "marketingStrategy":
              parsedContent.marketingStrategy = {
                brandPositioning: {
                  positioningStatement: `Complete positioning strategy for ${submissionData.businessNiche} targeting ${submissionData.targetAgeGroup?.[0]}-${submissionData.targetAgeGroup?.[1]} year olds in ${submissionData.location}.`,
                  brandIdentity: `Comprehensive brand framework with ${submissionData.brandTone} tone and visual guidelines.`,
                },
                customerAcquisitionFunnel: {
                  awareness: {
                    localSEO: "Local search optimization strategy",
                    socialMediaAds: "Social media advertising approach",
                    publicRelations: "PR and community outreach plan",
                  },
                  interest: {
                    contentMarketing: "Content strategy and calendar",
                    leadMagnets: "Lead generation resources",
                  },
                  desire: {
                    testimonials: "Customer testimonial system",
                    caseStudies: "Success story framework",
                    emailNurturing: "Email automation sequences",
                  },
                  action: {
                    launchOffers: "Grand opening promotions",
                    callsToAction: "Conversion optimization strategy",
                  },
                },
                launchBudget: {
                  budgetAllocation: `Marketing budget breakdown from available funds`,
                  weeklyTimeline: "12-week launch campaign schedule",
                  performanceTracking: "KPI tracking and ROI measurement",
                },
              };
              break;
            case "complianceLegal":
              parsedContent.complianceLegal = {
                businessRegistration: {
                  legalStructure: `Business structure analysis for ${submissionData.businessNiche} in ${submissionData.location}`,
                  registrationProcess: "Step-by-step registration guide",
                  requiredDocumentation: "Complete document checklist",
                },
                regulatoryCompliance: {
                  industryRegulations:
                    "Industry-specific regulations and requirements",
                  taxRequirements: "Tax obligations and filing schedules",
                  dataProtection: "Privacy and data security compliance",
                },
                riskManagement: {
                  legalRiskAssessment:
                    "Comprehensive risk analysis and mitigation",
                  insuranceRequirements:
                    "Essential insurance coverage recommendations",
                  complianceMonitoring: "Ongoing compliance tracking system",
                },
              };
              break;
            case "partnershipCommunity":
              parsedContent.partnershipCommunity = {
                strategicAlliances: {
                  partnershipTypes: "Strategic partnership opportunities",
                  partnershipStrategy:
                    "Partner identification and development process",
                  mutualBenefits:
                    "Value creation and revenue sharing framework",
                },
                localIntegration: {
                  communityInitiatives:
                    "Community engagement and involvement strategy",
                  localSponsorship:
                    "Local sponsorship and event participation plan",
                  networkingStrategy:
                    "Business networking and relationship building",
                },
                customerFeedback: {
                  npsSystem: "Net Promoter Score implementation",
                  feedbackCollection:
                    "Multi-channel feedback collection system",
                  loyaltyProgram: "Customer retention and loyalty program",
                },
              };
              break;
            case "scalabilityPlan":
              parsedContent.scalabilityPlan = {
                phasedGrowth: {
                  year1: "Foundation and establishment phase milestones",
                  year2: "Expansion and scaling objectives",
                  year3: "Market leadership and strategic development",
                },
                scalingTriggers: {
                  revenueThresholds:
                    "Revenue milestones for expansion decisions",
                  customerMilestones:
                    "Customer metrics indicating scaling readiness",
                  marketIndicators: "Market conditions supporting growth",
                },
                operationalBottlenecks:
                  "Capacity constraints and scaling solutions",
                exitStrategies: {
                  acquisition:
                    "Strategic acquisition positioning and valuation",
                  managementBuyout: "Management team acquisition framework",
                  lifestyleBusiness: "Sustainable lifestyle business approach",
                },
              };
              break;
          }
        });

        console.log(
          "✅ Added structure for missing sections:",
          missingSections
        );
      }

      console.log(
        "📊 Final validation - All required sections present:",
        requiredSections.every((section) => parsedContent[section])
      );

      // Log the final parsed content structure
      console.log("\n📋 FINAL PARSED CONTENT STRUCTURE:");
      console.log("=".repeat(50));
      console.log("Available sections:", Object.keys(parsedContent));

      // Log specific sections we're interested in
      const sectionsToCheck = [
        "hrStaffing",
        "financialPlanning",
        "inventorySupply",
      ];
      sectionsToCheck.forEach((sectionName) => {
        if (parsedContent[sectionName]) {
          console.log(`\n✅ ${sectionName}:`);
          console.log(
            `   - Subsections: ${Object.keys(parsedContent[sectionName]).join(
              ", "
            )}`
          );

          // Show sample content for organizational chart if available
          if (
            sectionName === "hrStaffing" &&
            parsedContent[sectionName].organizationalChart
          ) {
            const day1Content =
              parsedContent[sectionName].organizationalChart.day1;
            if (day1Content) {
              console.log(
                `   - Day1 content preview: ${day1Content.substring(0, 150)}...`
              );
            }
          }
        } else {
          console.log(`\n❌ ${sectionName}: MISSING`);
        }
      });
      console.log("=".repeat(50) + "\n");

      // Create response record in database
      const responseData = {
        submissionId: submissionData.id,
        userId: submissionData.userId,
        businessName: submissionData.businessNiche,
        content: parsedContent,
        generatedAt: new Date(),
        status: "completed",
      };

      const responseResult = await this.createManualResponse(responseData);

      if (!responseResult.success) {
        throw new Error(responseResult.error);
      }

      return {
        success: true,
        data: responseResult.data,
        response: parsedContent, // Return structured content
        responseId: responseResult.data.id,
        submission: submissionData,
      };
    } catch (error) {
      console.error("Error generating business manual:", error);

      let errorMessage = "Failed to generate business manual";

      if (error.message.includes("API_KEY")) {
        errorMessage =
          "Invalid API key. Please check your GOOGLE_CLOUD_API_KEY configuration.";
      } else if (
        error.message.includes("quota") ||
        error.message.includes("rate")
      ) {
        errorMessage = "API rate limit exceeded. Please try again later.";
      } else if (
        error.message.includes("network") ||
        error.message.includes("fetch")
      ) {
        errorMessage = "Network error. Please check your internet connection.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      return { success: false, error: errorMessage, code: "GENERATION_ERROR" };
    }
  }

  /**
   * Build comprehensive business manual prompt with structured JSON output
   */
  buildAdvancedBusinessManualPrompt(submissionData, marketResearch = null) {
    const businessContext = this.analyzeBusinessContext(submissionData);
    const currentDate = new Date().toISOString().split("T")[0];

    // Calculate financial projections
    const monthlyBudget = Math.round(
      (submissionData.budgetRange?.[1] || 20000) / 12
    );
    const monthlyRevenueTarget = Math.round(
      (submissionData.annualRevenueGoal || 50000) / 12
    );
    const breakEvenMonths = Math.ceil(
      (submissionData.budgetRange?.[0] || 5000) / (monthlyRevenueTarget * 0.3)
    );

    return `Create a complete business manual for ${
      submissionData.businessNiche
    } in ${submissionData.location}.

CRITICAL: ALL sections must be filled with detailed, specific content. NO "No data available" allowed.

Business Details:
- Type: ${submissionData.businessNiche}
- Location: ${submissionData.location}
- Budget: $${submissionData.budgetRange?.[0]}-$${
      submissionData.budgetRange?.[1]
    }
- Revenue Goal: $${submissionData.annualRevenueGoal}
- Target Age: ${submissionData.targetAgeGroup?.[0]}-${
      submissionData.targetAgeGroup?.[1]
    }

Generate this EXACT JSON with ALL fields completed:
- Stage: ${submissionData.businessStage || "Planning"}
- Budget: $${submissionData.budgetRange?.[0] || 5000} - $${
      submissionData.budgetRange?.[1] || 20000
    }
- Revenue Goal: $${
      submissionData.annualRevenueGoal || 50000
    }/year ($${monthlyRevenueTarget}/month)
- Target Age: ${submissionData.targetAgeGroup?.[0] || 25}-${
      submissionData.targetAgeGroup?.[1] || 45
    } years
- Time Available: ${submissionData.weeklyTimeAllocation || 40} hours/week
- Experience: ${submissionData.experienceLevel || "Intermediate"}
- Brand Tone: ${submissionData.brandTone || "Professional"}

Return this EXACT JSON structure (no markdown, no code blocks):

{
  "executiveSummary": {
    "overview": "300-word strategic summary with unique value proposition for ${
      submissionData.businessNiche
    } in ${submissionData.location}",
    "keyObjectives": ["Objective 1", "Objective 2", "Objective 3"],
    "criticalSuccessFactors": ["Factor 1", "Factor 2", "Factor 3"],
    "implementationTimeline": "High-level 12-month roadmap"
  },
  "kpiDashboard": {
    "financial": {
      "monthlyRecurringRevenue": "$${monthlyRevenueTarget}",
      "customerAcquisitionCost": "Calculate based on budget and customer targets",
      "lifetimeValue": "Calculate based on business model",
      "grossMarginPercentage": "Target percentage based on industry"
    },
    "operational": {
      "customerSatisfactionScore": "Target CSAT score",
      "inventoryTurnoverRate": "If applicable to business type",
      "employeeRetentionRate": "Target retention percentage"
    },
    "marketing": {
      "websiteConversionRate": "Target conversion percentage",
      "costPerLead": "Target CPL amount",
      "socialMediaEngagementRate": "Target engagement percentage"
    }
  },
  "businessSetup": {
    "marketResearch": {
      "targetMarketAnalysis": "Detailed analysis for ${
        submissionData.location
      } market",
      "competitorLandscape": "Key competitors and positioning opportunities",
      "customerPersona": "Detailed persona for ages ${
        submissionData.targetAgeGroup?.[0] || 25
      }-${submissionData.targetAgeGroup?.[1] || 45}",
      "marketPositioning": "Unique positioning strategy"
    },
    "businessPlan": {
      "executiveSummary": "Business objectives and mission",
      "swotAnalysis": {
        "strengths": ["Strength 1", "Strength 2"],
        "weaknesses": ["Weakness 1", "Weakness 2"],
        "opportunities": ["Opportunity 1", "Opportunity 2"],
        "threats": ["Threat 1", "Threat 2"]
      },
      "serviceOfferings": "Product/service lineup and pricing strategy"
    },
    "locationSetup": {
      "siteSelectionCriteria": "Criteria for ${submissionData.storeType} in ${
      submissionData.location
    }",
      "physicalSpaceRequirements": "Space needs and layout",
      "interiorDesign": "Design recommendations for ${
        submissionData.brandTone
      } brand"
    },
    "legalCompliance": {
      "businessStructure": "LLC vs S-Corp vs Sole Proprietorship analysis",
      "licensesPermits": "Required licenses for ${submissionData.location}",
      "intellectualProperty": "Brand protection strategy",
      "contractTemplates": "Key contract types and clauses"
    },
    "financialPlanning": {
      "budgetAllocation": "Breakdown of $${submissionData.budgetRange?.[0]}-$${
      submissionData.budgetRange?.[1]
    } budget",
      "revenueStreams": "Streams to achieve $${
        submissionData.annualRevenueGoal
      } goal",
      "cashFlowManagement": "Cash flow optimization strategies"
    }
  },
  "equipmentInfrastructure": {
    "siteSelection": {
      "scoringMatrix": "Location evaluation: Foot traffic (25%), Demographics match (20%), Competition proximity (15%), Rent cost (20%), Accessibility (10%), Future growth potential (10%). Score each factor 1-10, minimum total score 60 for viable location.",
      "locationFactors": "High foot traffic areas near tech hubs, colleges, or shopping centers. Target locations with 25-45 age group concentration, moderate competition (2-3 competitors within 1km), rent under 15% of projected revenue, good parking/public transport access."
    },
    "technologyStack": {
      "pointOfSale": "Square POS system ($169/month) or Shopify POS ($89/month) with inventory management, payment processing, customer tracking, and mobile integration for seamless online-offline experience.",
      "crm": "HubSpot CRM (free tier) or Zoho CRM ($12/month) for customer database, follow-up tracking, service history, warranty management, and targeted marketing campaigns.",
      "accounting": "QuickBooks Online ($25/month) or Zoho Books ($15/month) for expense tracking, tax preparation, profit/loss analysis, invoice generation, and financial reporting automation.",
      "projectManagement": "Slack ($7.25/user/month) for team communication, Trello (free) for task management, and WhatsApp Business (free) for customer communication and support."
    },
    "physicalAssets": {
      "essential": "Display cases ($800), cash register/POS system ($500), basic furniture ($300), security system ($400), basic tools for repairs ($200), initial signage ($300). Total: $2,500",
      "optimal": "Professional display lighting ($300), customer seating area ($200), advanced repair equipment ($500), branded displays ($400), tablet for demonstrations ($300). Additional: $1,700",
      "premium": "Smart security system with cameras ($800), premium interior design ($1,000), advanced diagnostic tools ($1,200), interactive product displays ($600). Premium add-on: $3,600",
      "budgetBreakdown": "Tier 1 (Essential): $2,500 for basic operations. Tier 2 (Growth): Additional $1,700 for enhanced customer experience. Tier 3 (Premium): Additional $3,600 for market leadership positioning."
    }
  },
  "hrStaffing": {
    "organizationalChart": {
      "day1": "REQUIRED: Detailed initial team structure including founder role, first hire position (customer service/operations assistant), role responsibilities, reporting structure, and decision-making hierarchy for ${
        submissionData.businessNiche
      } startup",
      "month6": "REQUIRED: Comprehensive 6-month expansion plan including 2-3 additional hires, department creation, management layers, role specialization, team coordination processes, and growth-stage organizational structure",
      "year2": "REQUIRED: Full organizational growth structure with department heads, middle management, specialized roles, cross-functional teams, performance management systems, and scalable hierarchy for ${
        submissionData.businessNiche
      } business"
    },
    "keyRoles": {
      "jobScorecards": "REQUIRED: Complete job scorecards for first 3 critical hires including: (1) Operations Manager - mission, 5 key outcomes, 10 measurable KPIs, required competencies; (2) Sales/Customer Success - mission, outcomes, KPIs, skills; (3) Marketing Coordinator - detailed scorecard with specific metrics and responsibilities",
      "competencyRequirements": "REQUIRED: Detailed skills matrix including technical skills, soft skills, industry experience, education requirements, certifications needed, personality traits, and cultural fit criteria for each role in ${
        submissionData.businessNiche
      }"
    },
    "talentAcquisition": {
      "sourcingStrategy": "REQUIRED: Specific talent sourcing plan for ${
        submissionData.location
      } including local job boards (Indeed, LinkedIn, ZipRecruiter), industry-specific platforms, networking events, referral program design, headhunter contacts, university partnerships, and budget allocation per channel",
      "interviewProcess": "REQUIRED: Complete 4-stage interview process: (1) Phone screening with specific questions, (2) Skills assessment with practical tests, (3) Cultural fit interview with behavioral questions, (4) Final decision meeting with reference checks and salary negotiation framework",
      "onboardingProgram": "REQUIRED: Comprehensive 90-day onboarding plan including Day 1 orientation checklist, Week 1 training modules, Month 1 goal setting, Month 2 skill development, Month 3 performance review, mentorship assignment, and cultural integration activities"
    },
    "compensationCulture": {
      "salaryStrategy": "REQUIRED: Detailed compensation framework including base salary ranges for each role (within $${
        submissionData.budgetRange?.[0]
      }-$${
      submissionData.budgetRange?.[1]
    } budget), performance bonuses (5-15% of base), equity/profit sharing options, benefits package, and annual review process",
      "cultureprinciples": ["Customer-first mindset with specific behaviors and practices", "Continuous learning and professional development culture", "Transparent communication and regular feedback loops", "Results-oriented performance with measurable outcomes", "Work-life balance with flexible scheduling options"]
    }
  },
  "financialPlanning": {
    "capitalRequirements": {
      "capexBreakdown": "REQUIRED: Detailed one-time capital expenditures from $${
        submissionData.budgetRange?.[0]
      }-$${
      submissionData.budgetRange?.[1]
    } budget including: Equipment/Technology ($X,XXX), Initial Inventory ($X,XXX), Legal/Professional fees ($X,XXX), Marketing launch ($X,XXX), Working capital ($X,XXX), with specific vendor quotes and timing",
      "opexBreakdown": "REQUIRED: Monthly operational expenses breakdown including: Rent/Utilities ($XXX), Insurance ($XXX), Marketing ($XXX), Salaries ($X,XXX), Software subscriptions ($XXX), Professional services ($XXX), Miscellaneous ($XXX) - total monthly burn rate calculation",
      "contingencyFund": "REQUIRED: Emergency fund allocation of 15-20% of total budget ($X,XXX) for unexpected expenses, market downturns, equipment failures, legal issues, or opportunity investments with specific access criteria and replenishment strategy"
    },
    "financialProjections": {
      "pessimistic": {
        "revenue": "REQUIRED: 24-month worst-case scenario with monthly revenue projections starting at $${Math.round(
          monthlyRevenueTarget * 0.5
        )} Month 1, scaling to $${Math.round(
      monthlyRevenueTarget * 0.8
    )} by Month 24, including seasonal variations and market challenges",
        "expenses": "REQUIRED: Conservative expense forecast with 20% higher costs, delayed revenue recognition, extended customer acquisition periods, and market penetration challenges with specific monthly projections",
        "breakeven": "REQUIRED: Break-even analysis showing ${Math.ceil(
          breakEvenMonths * 1.5
        )} months to profitability in pessimistic scenario with cash flow timing and funding requirements"
      },
      "realistic": {
        "revenue": "REQUIRED: 24-month expected revenue projection with monthly targets from $${Math.round(
          monthlyRevenueTarget * 0.7
        )} Month 1 to $${monthlyRevenueTarget} by Month 12, continuing to $${Math.round(
      monthlyRevenueTarget * 1.5
    )} Month 24, based on market research and competitor analysis",
        "expenses": "REQUIRED: Realistic expense forecast with detailed monthly breakdown, staff additions timeline, marketing spend optimization, and operational scaling costs with quarterly reviews",
        "breakeven": "REQUIRED: Expected break-even at Month ${breakEvenMonths} with positive cash flow, sustainable growth metrics, and reinvestment strategy for continued expansion"
      },
      "optimistic": {
        "revenue": "REQUIRED: 24-month best-case projection with accelerated growth from $${monthlyRevenueTarget} Month 1 to $${Math.round(
      monthlyRevenueTarget * 2
    )} by Month 12, reaching $${Math.round(
      monthlyRevenueTarget * 3
    )} Month 24 through market leadership and expansion opportunities",
        "expenses": "REQUIRED: Optimistic expense management with economies of scale, efficient operations, strategic partnerships reducing costs, and aggressive but sustainable growth investments",
        "breakeven": "REQUIRED: Accelerated break-even at Month ${Math.floor(
          breakEvenMonths * 0.7
        )} with rapid profitability, reinvestment opportunities, and expansion funding for market dominance"
      }
    },
    "fundingStrategy": {
      "bootstrapping": "REQUIRED: Self-funding analysis for ${
        submissionData.businessNiche
      } including pros (complete control, no debt, organic growth), cons (limited capital, slower expansion, personal risk), cash flow management, and growth limitations with specific recommendations",
      "debtFinancing": "REQUIRED: SBA loan options (SBA 7(a), microloans, express loans), traditional bank financing, equipment financing, and alternative lending with specific lenders, qualification requirements, terms, and application process for ${
        submissionData.location
      }",
      "equityInvestment": "REQUIRED: Angel investor and VC considerations including valuation expectations (3-5x revenue multiple), equity dilution scenarios (10-25%), investor selection criteria, pitch deck requirements, and exit strategy alignment for ${
        submissionData.businessNiche
      } industry"
    },
    "cashFlowTactics": ["Implement net-30 payment terms with 2% early payment discounts to accelerate receivables", "Negotiate net-60 payment terms with suppliers to extend payables and improve cash flow timing", "Establish business line of credit ($XX,XXX) for seasonal fluctuations and opportunity investments", "Create invoice factoring relationships for immediate cash conversion during growth phases", "Implement subscription or retainer models to ensure predictable monthly recurring revenue streams"]
  },
  "inventorySupply": {
    "applicable": ${
      ["retail", "restaurant", "physical", "hybrid"].includes(
        submissionData.storeType
      )
        ? "true"
        : "false"
    },
    "supplierVetting": {
      "scoringCriteria": "REQUIRED: Comprehensive supplier evaluation matrix including: Cost competitiveness (25% weight), Quality standards and certifications (25%), Reliability and on-time delivery (20%), Payment terms and flexibility (15%), Geographic proximity and shipping costs (10%), Customer service responsiveness (5%) with specific scoring methodology 1-10 scale",
      "primarySuppliers": "REQUIRED: Strategic primary supplier selection for ${
        submissionData.businessNiche
      } including: 3-5 main suppliers with contact information, product categories, pricing structures, minimum order quantities, lead times, quality certifications, and relationship management protocols",
      "backupSuppliers": "REQUIRED: Risk mitigation through secondary supplier relationships including: 2-3 backup suppliers per critical category, alternative sourcing strategies, emergency procurement procedures, and supplier diversification to prevent supply chain disruptions"
    },
    "inventoryOptimization": {
      "managementStrategy": "REQUIRED: ${
        submissionData.storeType === "retail"
          ? "Just-in-Time inventory management"
          : submissionData.storeType === "restaurant"
          ? "FIFO rotation with perishable management"
          : "Economic Order Quantity (EOQ) optimization"
      } strategy including inventory turnover targets (${
      submissionData.businessNiche.includes("food")
        ? "12-15x annually"
        : "6-8x annually"
    }), stock level optimization, and demand forecasting methodology",
      "initialOrders": "REQUIRED: Starting inventory investment plan allocating $${Math.round(
        (submissionData.budgetRange?.[0] || 10000) * 0.3
      )} from startup budget including: Fast-moving items (60% of budget), Medium-velocity products (30%), Slow-moving specialty items (10%) with specific product categories and quantities",
      "reorderPoints": "REQUIRED: Automated inventory triggers including: Minimum stock levels (2-4 weeks supply), reorder quantities (4-8 weeks supply), seasonal adjustment factors, lead time buffers, and inventory management software recommendations (TradeGecko, Cin7, or Zoho Inventory)"
    },
    "logisticsStrategy": {
      "receivingProcess": "REQUIRED: Comprehensive goods receipt procedure including: Delivery scheduling and receiving hours, quality inspection checklist, damage reporting protocols, inventory system updates, vendor invoice matching, and storage procedures with staff training requirements",
      "fulfillmentProcess": "REQUIRED: Order processing workflow from customer order to delivery including: Order verification, picking procedures, packing standards, shipping carrier selection (UPS, FedEx, USPS), tracking implementation, and customer communication protocols with timing standards",
      "returnsManagement": "REQUIRED: Customer return policy and processing including: 30-day return window, condition requirements, restocking procedures, refund processing timeline (5-7 business days), return shipping arrangements, and inventory disposition (resale, disposal, warranty claims)"
    }
  },
  "marketingStrategy": {
    "brandPositioning": {
      "positioningStatement": "REQUIRED: For ${
        submissionData.businessNiche
      } in ${
      submissionData.location
    }, create a compelling positioning statement targeting ${
      submissionData.targetAgeGroup?.[0]
    }-${
      submissionData.targetAgeGroup?.[1]
    } year olds. Include: (1) Target audience definition, (2) Category placement in local market, (3) Unique value proposition vs competitors, (4) Key brand differentiator, (5) Emotional benefit. Example: 'For busy professionals aged ${
      submissionData.targetAgeGroup?.[0]
    }-${submissionData.targetAgeGroup?.[1]} in ${
      submissionData.location
    }, [BusinessName] is the premier ${
      submissionData.businessNiche
    } that delivers [unique benefit] through [differentiator], making you feel [emotional outcome].'",
      "brandIdentity": "REQUIRED: Complete brand identity framework including: Voice (${
        submissionData.brandTone
      } tone with specific personality traits like approachable, expert, trustworthy), Visual guidelines (color palette suggestions, typography style, imagery direction), Messaging pillars (3-5 core messages), Brand personality (human characteristics if brand were a person), Communication style (formal/casual, technical/simple, emotional/rational), and brand promise specific to ${
      submissionData.businessNiche
    } industry standards."
    },
    "customerAcquisitionFunnel": {
      "awareness": {
        "localSEO": "REQUIRED: Comprehensive local SEO strategy for ${
          submissionData.location
        } including: Primary keywords (10-15 terms like '${
      submissionData.businessNiche
    } near me', '${submissionData.businessNiche} ${
      submissionData.location
    }'), Google My Business optimization checklist (photos, posts, reviews response strategy), Local directory submissions (Yelp, Yellow Pages, industry-specific directories), Review management system (automated review requests, response templates), Local content strategy (location-based blog posts, community event coverage).",
        "socialMediaAds": "REQUIRED: Platform-specific advertising strategy with $${Math.round(
          (submissionData.budgetRange?.[1] || 20000) * 0.15
        )} monthly ad budget: Facebook/Instagram ads (60% of budget, targeting ${
      submissionData.targetAgeGroup?.[0]
    }-${submissionData.targetAgeGroup?.[1]} in ${
      submissionData.location
    }, interests: [relevant interests], ad formats: carousel, video, lead ads), Google Ads (30% budget, search campaigns for high-intent keywords, local service ads), LinkedIn ads (10% budget if B2B component), creative guidelines (${
      submissionData.brandTone
    } messaging, visual consistency), A/B testing framework.", 
        "publicRelations": "REQUIRED: Strategic PR plan including: Local media contact list (newspapers, radio stations, blogs in ${
          submissionData.location
        }), Press release templates for launch/milestones, Community event calendar (monthly participation targets), Thought leadership strategy (expert commentary on ${
      submissionData.businessNiche
    } trends), Crisis communication plan, Media kit preparation (business story, founder bio, high-res photos, fact sheet)."
      },
      "interest": {
        "contentMarketing": "REQUIRED: 90-day content calendar for ${
          submissionData.businessNiche
        } including: Blog content (weekly posts: how-to guides, industry insights, local stories), Video content (monthly: behind-scenes, tutorials, customer features), Social media calendar (daily posts with themes: Monday motivation, Wednesday tips, Friday features), Educational resources (downloadable guides, checklists, templates), SEO optimization (target keywords, internal linking strategy), Content distribution plan across all channels.",
        "leadMagnets": "REQUIRED: High-value lead magnets specific to ${
          submissionData.businessNiche
        }: (1) Ultimate Guide to [relevant topic] (20-page PDF with actionable tips), (2) Free consultation/assessment offer (30-minute sessions), (3) Exclusive discount for first-time customers (percentage based on average order value), (4) Resource toolkit (templates, checklists, calculators), (5) Email course series (5-7 part educational sequence), landing page design requirements, email automation setup."
      },
      "desire": {
        "testimonials": "REQUIRED: Systematic testimonial collection including: Customer interview template (specific questions about problems solved, results achieved, experience), Video testimonial guidelines (3-5 minute format, key talking points), Written testimonial process (email templates, incentives), Display strategy (website placement, social proof widgets, case study format), Review platform management (Google, Yelp, Facebook reviews), customer success story development process.",
        "caseStudies": "REQUIRED: Case study framework for ${
          submissionData.businessNiche
        }: Template structure (customer background, challenge faced, solution provided, specific results with metrics, customer quote), Development process (customer selection criteria, interview scheduling, content creation timeline), Distribution strategy (website, sales materials, social media), Success metrics to highlight (ROI, time savings, satisfaction scores), Visual presentation guidelines (before/after photos, infographics, result charts).",
        "emailNurturing": "REQUIRED: Complete email automation sequences: Welcome series (5 emails over 2 weeks introducing business, values, services), Educational series (weekly tips and insights), Product/service showcase (monthly features with benefits), Customer success stories (bi-weekly case studies), Promotional campaigns (seasonal offers, special events), Re-engagement campaigns (for inactive subscribers), personalization strategy (name, location, preferences), segmentation approach (new vs existing customers)."
      },
      "action": {
        "launchOffers": "REQUIRED: Grand opening campaign for ${
          submissionData.businessNiche
        }: (1) Early bird special (30% off first month/service for first 50 customers), (2) Referral program (existing customers get 20% discount for each referral), (3) Bundle packages (combine services for 25% savings), (4) Limited-time bonus (free add-on service worth $X), (5) Social media contest (follow, share, tag friends for prizes), offer timeline (pre-launch, soft opening, grand opening phases), tracking and fulfillment process.",
        "callsToAction": "REQUIRED: Compelling CTAs for all touchpoints: Website (above fold: 'Schedule Free Consultation', 'Get Started Today'), Social media (bio links, post CTAs, story swipe-ups), Email signatures (book appointment link), Business cards (QR code to special offer), In-person (verbal CTAs with urgency), Advertisement CTAs (limited time offers), A/B testing framework for optimization, conversion tracking setup."
      }
    },
    "launchBudget": {
      "budgetAllocation": "REQUIRED: Detailed 90-day marketing budget from $${Math.round(
        (submissionData.budgetRange?.[1] || 20000) * 0.2
      )} total allocation: Digital advertising (40% = $${Math.round(
      (submissionData.budgetRange?.[1] || 20000) * 0.08
    )}), Content creation (25% = $${Math.round(
      (submissionData.budgetRange?.[1] || 20000) * 0.05
    )}), PR and events (20% = $${Math.round(
      (submissionData.budgetRange?.[1] || 20000) * 0.04
    )}), Marketing tools and software (10% = $${Math.round(
      (submissionData.budgetRange?.[1] || 20000) * 0.02
    )}), Miscellaneous and testing (5% = $${Math.round(
      (submissionData.budgetRange?.[1] || 20000) * 0.01
    )}), expected ROI: 3:1 minimum return on marketing spend.",
      "weeklyTimeline": "REQUIRED: 12-week launch timeline: Week 1-2 (brand identity finalization, website launch, social media setup), Week 3-4 (content creation, PR outreach, Google My Business optimization), Week 5-6 (paid advertising launch, email marketing setup, local networking), Week 7-8 (soft opening campaign, customer feedback collection, strategy refinement), Week 9-10 (grand opening event, maximum promotion push, influencer outreach), Week 11-12 (campaign optimization, performance analysis, scaling successful tactics), specific daily tasks and deliverables for each week.",
      "performanceTracking": "REQUIRED: Comprehensive KPI dashboard: Lead generation metrics (website traffic, form submissions, phone calls, email signups), Conversion metrics (lead-to-customer rate, average deal size, sales cycle length), Customer metrics (acquisition cost, lifetime value, retention rate, satisfaction scores), Marketing channel performance (cost per lead by channel, ROI by campaign, engagement rates), Business growth indicators (monthly recurring revenue, customer count growth, market share), tracking tools (Google Analytics, CRM reports, social media insights), weekly reporting schedule and review process."
    }
  },
  "complianceLegal": {
    "businessRegistration": {
      "legalStructure": "REQUIRED: Comprehensive analysis for ${
        submissionData.businessNiche
      } in ${
      submissionData.location
    }: LLC Recommendation (Pros: Limited liability protection, tax flexibility, simple management structure, credibility with customers/suppliers. Cons: Self-employment taxes, limited fundraising options. Best for: Single owner or small partnerships with $${
      submissionData.budgetRange?.[0]
    }-$${
      submissionData.budgetRange?.[1]
    } budget). S-Corp Alternative (Pros: Tax savings on self-employment, easier to add investors, potential salary + distribution structure. Cons: More paperwork, stricter regulations, limited ownership types. Consider if: Annual revenue expected above $60,000). Specific recommendation: LLC for ${
      submissionData.businessNiche
    } due to operational flexibility and protection needs.",
      "registrationProcess": "REQUIRED: Step-by-step registration for ${
        submissionData.location
      }: (1) Choose and reserve business name (check availability on state website, consider trademark search), (2) File Articles of Organization with Secretary of State (fee: $X, processing time: X days), (3) Obtain EIN from IRS (online application, immediate processing), (4) Create Operating Agreement (define ownership, management structure, profit distribution), (5) Register for state taxes (sales tax permit if selling products, employer taxes if hiring), (6) Open business bank account (EIN, Articles of Organization, ID required), (7) Obtain business license ($X fee, annual renewal), timeline: 2-3 weeks total completion.",
      "requiredDocumentation": "REQUIRED: Complete document checklist: Legal formation (Articles of Organization, Operating Agreement, EIN letter), Licenses and permits (business license, professional licenses for ${
        submissionData.businessNiche
      }, zoning permits), Tax registrations (state tax ID, sales tax permit, employer ID), Banking (business bank account, business credit card applications), Insurance documentation (general liability policy, workers comp if employees), Contracts and agreements (vendor agreements, employment contracts, customer terms of service), Record-keeping system (accounting software setup, document storage plan)."
    },
    "regulatoryCompliance": {
      "industryRegulations": "REQUIRED: Specific regulations for ${
        submissionData.businessNiche
      } businesses: Federal requirements (OSHA workplace safety standards, ADA accessibility compliance, Fair Labor Standards Act if employees), State regulations (${
      submissionData.location
    } business licensing, professional certifications, industry-specific permits), Local requirements (zoning compliance, signage permits, parking requirements, noise ordinances), Industry standards (health department regulations if food service, professional association requirements, quality certifications), Environmental compliance (waste disposal, emissions if applicable), ongoing monitoring (annual renewals, inspection schedules, regulatory update subscriptions).",
      "taxRequirements": "REQUIRED: Complete tax obligation breakdown: Federal taxes (Income tax Form 1120S or 1065, Employment taxes if hiring, Self-employment tax considerations), State taxes (${
        submissionData.location
      } income tax, sales tax collection and remittance, unemployment insurance), Local taxes (business personal property tax, local income taxes), Tax calendar (Quarterly estimated payments due dates, Annual filing deadlines, Payroll tax deposit schedules), Record keeping (7-year retention rule, required documentation, accounting method selection), Tax planning strategies (deductible business expenses, depreciation schedules, retirement plan contributions).",
      "dataProtection": "REQUIRED: Privacy and data security compliance: Privacy policy requirements (customer data collection disclosure, cookie usage, third-party sharing policies), Data security measures (SSL certificates for website, payment processing compliance, customer information storage protocols), Compliance frameworks (GDPR if serving EU customers, CCPA for California residents, PIPEDA if Canadian customers), Security protocols (password policies, data access controls, breach notification procedures), Technology safeguards (firewall setup, regular software updates, backup systems), staff training (privacy awareness, data handling procedures, incident response protocols)."
    },
    "riskManagement": {
      "legalRiskAssessment": "REQUIRED: Comprehensive risk analysis for ${
        submissionData.businessNiche
      }: Liability risks (customer injury on premises, product/service defects, professional errors, property damage), Employment risks (discrimination claims, wrongful termination, wage and hour violations, workplace safety incidents), Contract risks (vendor disputes, customer disagreements, lease issues, partnership conflicts), Intellectual property risks (trademark infringement, copyright violations, trade secret protection), Financial risks (cash flow problems, customer payment defaults, fraud, embezzlement), mitigation strategies (proper contracts, insurance coverage, legal counsel relationships, risk monitoring systems).",
      "insuranceRequirements": "REQUIRED: Essential insurance coverage analysis: General Liability ($1-2M coverage, protects against customer injury/property damage, annual cost: $500-1,500), Professional Liability (Errors & Omissions, $1M coverage for service-based businesses, cost: $800-2,000/year), Property Insurance (Equipment, inventory, business property, replacement cost coverage), Workers Compensation (Required if employees, covers workplace injuries, rate based on payroll and risk classification), Cyber Liability ($1M coverage for data breaches, cost: $1,000-3,000/year), Business Interruption (Income replacement during forced closure), recommended carriers (State Farm, Progressive, Hiscox for small business), annual review and adjustment schedule.",
      "complianceMonitoring": "REQUIRED: Ongoing compliance management system: Regulatory tracking (subscribe to industry updates, government notifications, legal requirement changes), Annual compliance calendar (license renewals, tax filings, insurance reviews, permit updates), Legal counsel relationships (business attorney contact, employment law specialist, tax professional), Documentation systems (compliance checklists, audit trails, policy updates), Training programs (employee compliance training, management legal updates, safety procedures), Performance monitoring (compliance metrics, incident tracking, legal issue resolution), quarterly compliance reviews and annual legal health checkups."
    }
  },
  "partnershipCommunity": {
    "strategicAlliances": {
      "partnershipTypes": "REQUIRED: Strategic partnership opportunities for ${
        submissionData.businessNiche
      } in ${
      submissionData.location
    }: (1) Supplier partnerships (negotiate better terms, priority service, exclusive products, volume discounts, extended payment terms), (2) Referral partnerships (complementary businesses that serve same target market, mutual customer referral agreements, commission structures), (3) Joint ventures (collaborative projects, shared marketing campaigns, co-developed services), (4) Technology partnerships (software integrations, preferred vendor status, beta testing opportunities), (5) Distribution partnerships (expand reach through other businesses, cross-selling opportunities), (6) Marketing alliances (shared advertising costs, co-promotional events, bundled offerings)",
      "partnershipStrategy": "REQUIRED: Systematic partner identification and development: Target identification (create ideal partner profile, research potential partners in ${
        submissionData.location
      }, evaluate compatibility and mutual benefits), Outreach process (initial contact templates, value proposition development, meeting scheduling system), Partnership evaluation (due diligence checklist, references and background checks, financial stability assessment), Agreement development (partnership terms negotiation, legal documentation, performance metrics establishment), Relationship management (regular communication schedule, joint planning sessions, performance reviews, conflict resolution procedures), partnership portfolio management (balance of partnership types, risk diversification, strategic alignment with business goals).",
      "mutualBenefits": "REQUIRED: Value creation framework for partnerships: Revenue opportunities (referral commissions 5-15% of sale value, joint service packages with 20-30% markup, shared customer acquisition costs), Cost savings (bulk purchasing power for 10-25% discounts, shared marketing expenses reducing individual costs by 30-50%, operational efficiency improvements), Market expansion (access to partner's customer base, geographic expansion through partner networks, industry expertise sharing), Competitive advantages (exclusive partnerships, differentiated service offerings, enhanced credibility through associations), Risk mitigation (shared business risks, backup supplier relationships, diversified revenue streams), knowledge exchange (industry insights, best practices sharing, skill development opportunities)."
    },
    "localIntegration": {
      "communityInitiatives": "REQUIRED: Community engagement strategy for ${
        submissionData.location
      }: Charitable involvement (adopt 2-3 local charities aligned with business values, monthly volunteer commitment of 4-8 hours, annual donation budget of $${Math.round(
      (submissionData.budgetRange?.[0] || 10000) * 0.02
    )}), Educational support (local school partnerships, student internship programs, career day participation, scholarship programs), Environmental responsibility (sustainable business practices, community cleanup participation, eco-friendly product sourcing), Cultural participation (local festivals and events, sponsorship opportunities, community center partnerships), Economic development (chamber of commerce membership, local business association involvement, 'buy local' campaign participation).",
      "localSponsorship": "REQUIRED: Strategic sponsorship program: Event selection criteria (target audience alignment with ${
        submissionData.targetAgeGroup?.[0]
      }-${
      submissionData.targetAgeGroup?.[1]
    } demographic, local visibility impact, budget appropriateness, brand fit assessment), Sponsorship levels (Title sponsor $2,000-5,000, Presenting sponsor $1,000-2,500, Supporting sponsor $500-1,000, In-kind contributions), ROI measurement (brand exposure metrics, lead generation tracking, customer acquisition attribution, community goodwill assessment), Activation strategies (booth presence, promotional giveaways, speaking opportunities, social media integration), Annual sponsorship budget allocation: $${Math.round(
      (submissionData.budgetRange?.[0] || 10000) * 0.03
    )} with quarterly review and adjustment process.",
      "networkingStrategy": "REQUIRED: Systematic networking approach: Organization memberships (Chamber of Commerce $300-500/year, industry associations $200-400/year, professional groups specific to ${
        submissionData.businessNiche
      }), Event attendance (weekly networking events, monthly industry conferences, quarterly community forums), Networking goals (meet 5 new contacts per event, follow up within 48 hours, schedule 2 coffee meetings per week), Personal branding (elevator pitch development, business card design, LinkedIn optimization, thought leadership content), Relationship nurturing (CRM tracking of networking contacts, monthly follow-up schedule, value-first approach, mutual support system), networking ROI tracking (leads generated, partnerships formed, referrals received, business opportunities created)."
    },
    "customerFeedback": {
      "npsSystem": "REQUIRED: Net Promoter Score implementation: Survey design (single question: 'How likely are you to recommend ${
        submissionData.businessNiche
      } to a friend or colleague?', 0-10 scale, follow-up question for feedback), Distribution timing (post-purchase/service delivery, quarterly relationship surveys, annual comprehensive reviews), Response collection (email automation, SMS surveys, in-person tablet surveys, online review requests), Scoring methodology (Promoters 9-10, Passives 7-8, Detractors 0-6, NPS = % Promoters - % Detractors), Action plans (Promoters: referral requests and testimonials, Passives: improvement targeting, Detractors: immediate service recovery), target NPS score: 50+ for ${
      submissionData.businessNiche
    } industry.",
      "feedbackCollection": "REQUIRED: Multi-channel feedback system: Post-transaction surveys (automated email 24 hours after service, 3-question maximum, mobile-optimized), Social media monitoring (daily check of mentions, reviews, comments on Facebook, Google, Yelp), In-person feedback (comment cards, verbal feedback training for staff, suggestion box), Exit surveys (for lost customers, cancellation feedback, improvement recommendations), Feedback aggregation (monthly summary reports, trend analysis, priority issue identification), Response protocols (24-hour response rule, personal responses to negative feedback, public thank you for positive reviews), feedback-driven improvements (monthly action items, quarterly process updates, annual service enhancements).",
      "loyaltyProgram": "REQUIRED: Customer retention program design: Points system (1 point per $1 spent, 100 points = $5 reward, bonus points for referrals and reviews), Tier structure (Bronze 0-499 points: 5% discount, Silver 500-999 points: 10% discount + early access, Gold 1000+ points: 15% discount + exclusive perks), Rewards catalog (service discounts, exclusive products, VIP experiences, partner business benefits), Referral incentives (both parties receive 20% discount, referrer gets bonus points, tracking system for attribution), Communication strategy (welcome packet, monthly newsletters, birthday rewards, anniversary recognition), Program promotion (website integration, social media campaigns, staff training on enrollment), success metrics (enrollment rate target: 60% of customers, retention improvement: 25% increase, revenue per customer: 20% growth)."
    }
  },
  "scalabilityPlan": {
    "phasedGrowth": {
      "year1": "REQUIRED: Foundation and establishment phase for ${
        submissionData.businessNiche
      }: Months 1-3 (Business setup: legal registration, location setup, initial team hiring, basic systems implementation, soft launch with limited customers), Months 4-6 (Market validation: customer acquisition target of 50-100 customers, service refinement based on feedback, process standardization, break-even achievement), Months 7-9 (Operational optimization: staff training programs, customer service excellence, inventory/supply chain efficiency, technology system upgrades), Months 10-12 (Growth preparation: market expansion research, additional service development, team expansion planning, financial system strengthening). Year 1 targets: $${Math.round(
      (submissionData.annualRevenueGoal || 50000) * 0.7
    )} revenue, 200+ customers, 95% customer satisfaction, positive cash flow.",
      "year2": "REQUIRED: Expansion and scaling phase: Months 13-15 (Service line expansion: introduce 2-3 additional services, premium service tiers, corporate/B2B offerings, partnership development), Months 16-18 (Geographic expansion: second location evaluation, online presence enhancement, delivery/service area expansion, market penetration strategies), Months 19-21 (Team scaling: department creation, management layer addition, specialist hiring, training system development), Months 22-24 (System automation: CRM implementation, automated marketing, financial reporting systems, operational efficiency improvements). Year 2 targets: $${Math.round(
        (submissionData.annualRevenueGoal || 50000) * 1.8
      )} revenue, 500+ customers, 5-8 employees, multiple revenue streams.", 
      "year3": "REQUIRED: Market leadership and expansion phase: Months 25-27 (Brand establishment: thought leadership, industry recognition, award submissions, media presence), Months 28-30 (Innovation development: new product/service innovation, technology integration, competitive differentiation, patent/IP protection), Months 31-33 (Strategic partnerships: major partnership agreements, franchise development, acquisition opportunities, investor relations), Months 34-36 (Exit preparation: business valuation, succession planning, growth capital raising, long-term strategy refinement). Year 3 targets: $${Math.round(
        (submissionData.annualRevenueGoal || 50000) * 3
      )} revenue, market leadership position, 10+ employees, acquisition interest or franchise opportunities."
    },
    "scalingTriggers": {
      "revenueThresholds": "REQUIRED: Specific revenue milestones for scaling decisions: Initial expansion trigger ($${Math.round(
        (submissionData.annualRevenueGoal || 50000) * 0.5
      )}/month for 3 consecutive months = consider additional staff/services), Significant scaling trigger ($${Math.round(
      (submissionData.annualRevenueGoal || 50000) * 1.0
    )}/month for 6 months = second location or major service expansion), Market leadership trigger ($${Math.round(
      (submissionData.annualRevenueGoal || 50000) * 2.0
    )}/month for 12 months = franchise development or acquisition strategy), each threshold includes cash flow positive requirement, 6-month revenue runway, and customer satisfaction above 90%.",
      "customerMilestones": "REQUIRED: Customer-based scaling indicators: Customer base growth (100 active customers = basic team expansion, 300 customers = department specialization, 500+ customers = management layer addition), Retention metrics (90%+ retention rate for 6 months = service expansion opportunity, 95%+ retention = premium service development), Customer acquisition trends (20+ new customers/month = marketing scale-up, 50+ new customers/month = operational scaling), Customer satisfaction thresholds (NPS 50+ = expansion readiness, NPS 70+ = franchise potential), customer lifetime value growth (CLV increase of 25% = service diversification opportunity).",
      "marketIndicators": "REQUIRED: External factors supporting scaling: Industry growth (${
        submissionData.businessNiche
      } industry growing 10%+ annually in ${
      submissionData.location
    }), Competitive landscape (limited direct competition or clear differentiation advantage), Economic conditions (stable local economy, positive employment trends, consumer spending growth), Regulatory environment (favorable business regulations, supportive local government policies), Technology trends (adoption of relevant technologies, digital transformation opportunities), Demographics (target age group ${
      submissionData.targetAgeGroup?.[0]
    }-${submissionData.targetAgeGroup?.[1]} population growth in ${
      submissionData.location
    }), market research validation (quarterly market analysis, competitor monitoring, trend identification)."
    },
    "operationalBottlenecks": "REQUIRED: Bottleneck identification and solutions: Staff capacity (current limitation: founder doing all operations, solution: hire operations manager by month 6, create standard operating procedures, implement delegation framework), Technology constraints (current: manual processes, solution: CRM implementation by month 4, automated marketing by month 8, inventory management system by month 12), Supply chain limitations (current: single supplier dependency, solution: establish 2-3 backup suppliers, negotiate volume discounts, implement inventory management), Physical space (current: limited capacity, solution: expansion plan for 2x space by year 2, flexible lease negotiations, efficient layout optimization), Financial systems (current: basic bookkeeping, solution: professional accounting system, monthly financial reporting, cash flow forecasting), quality control (solution: customer service standards, staff training programs, feedback systems implementation).",
    "exitStrategies": {
      "acquisition": "REQUIRED: Strategic acquisition positioning for ${
        submissionData.businessNiche
      }: Potential acquirer types (larger ${
      submissionData.businessNiche
    } chains seeking ${
      submissionData.location
    } presence, private equity firms focused on service businesses, strategic buyers in related industries, individual investors seeking established businesses), Valuation approach (industry multiple of 3-5x annual revenue for profitable ${
      submissionData.businessNiche
    } businesses, asset-based valuation for equipment and inventory, market approach using comparable sales), Preparation requirements (3 years of audited financials, legal compliance documentation, organized business operations, management systems independence from founder), Value enhancement strategies (improve profit margins to 15-20%, establish recurring revenue streams, build strong management team, develop proprietary processes/systems).",
      "managementBuyout": "REQUIRED: Management team acquisition framework: Team development (identify key employees with management potential, provide leadership training and equity incentives, create succession planning documentation), Financing structure (seller financing for 50-70% of purchase price, bank SBA loans for 20-30%, management team equity investment 10-20%), Transition planning (6-12 month transition period, training and knowledge transfer, gradual responsibility transfer), Legal framework (buy-sell agreements, earnout provisions based on performance, non-compete clauses), Valuation methodology (discounted for management team, performance-based payments, fair market value assessment), timeline (3-5 year preparation, 12-18 month execution period).",
      "lifestyleBusiness": "REQUIRED: Sustainable lifestyle business approach: Passive income generation (hire general manager to run daily operations, implement systems for owner oversight vs management, create passive ownership structure while maintaining quality), Work-life balance optimization (reduce owner hours to 20-30/week, maintain strategic oversight role, delegate operational responsibilities, flexible schedule development), Financial optimization (target 20-25% net profit margins, owner salary + profit distributions, tax-efficient business structure, retirement planning integration), Growth management (controlled growth to maintain quality and culture, avoid over-expansion stress, focus on profitability vs revenue growth), Legacy planning (family succession options, long-term wealth building, community impact continuation, business value preservation for retirement)."
    }
  },
  "actionPlan": {
    "first30Days": {
      "week1": ["Register business entity and obtain EIN", "Open business bank account and establish accounting system", "Secure initial location or finalize e-commerce platform setup"],
      "week2": ["Apply for necessary licenses and permits", "Set up basic technology infrastructure (POS, CRM, website)", "Establish relationships with 2-3 primary suppliers"],
      "week3": ["Complete initial inventory procurement worth $3,000-5,000", "Hire and train first employee (if applicable)", "Launch basic marketing campaigns and social media presence"],
      "week4": ["Conduct soft opening with friends/family for feedback", "Refine operations and customer service processes", "Implement customer feedback systems and review monitoring"]
    },
    "months2to6": {
      "majorMilestones": ["Achieve break-even point by month 4", "Establish customer base of 150+ unique customers", "Implement comprehensive digital marketing strategy with measurable ROI"],
      "teamExpansion": "Month 3: Hire part-time customer service assistant. Month 5: Add repair technician or expand to full-time operations assistant based on demand and revenue growth.",
      "marketingRollout": "Month 2: Launch Google Ads and Facebook campaigns. Month 3: Implement referral program. Month 4: Start email marketing campaigns. Month 6: Evaluate and optimize all channels based on performance data.",
      "financialTargets": "Month 2: $2,500 revenue. Month 3: $3,200 revenue. Month 4: $4,000 revenue (break-even). Month 5: $4,500 revenue. Month 6: $5,000+ revenue with 30%+ gross margin."
    },
    "months7to12": {
      "growthInitiatives": ["Expand product line to include premium accessories and extended warranties", "Launch corporate/bulk sales program for local businesses", "Implement loyalty program and customer retention strategies"],
      "processOptimization": "Streamline inventory management with automated reorder points, implement customer service standards and training protocols, establish key vendor relationships and negotiate better terms.",
      "marketExpansion": "Explore additional online marketplaces (Amazon, eBay), consider second location or franchise opportunities, develop B2B relationships with local businesses and organizations.",
      "performanceReview": "Monthly KPI review meetings, quarterly financial analysis and budget adjustments, annual strategic planning session, customer satisfaction surveys every 6 months."
    }
  }
}

FINAL REQUIREMENTS:
- Generate COMPREHENSIVE, detailed content for every single field and section
- Replace ALL template descriptions with specific, actionable content
- Make every section specific to ${submissionData.businessNiche} in ${
      submissionData.location
    }
- Use concrete numbers from the budget ($${submissionData.budgetRange?.[0]}-$${
      submissionData.budgetRange?.[1]
    }) and revenue goal ($${submissionData.annualRevenueGoal})
- Align with ${submissionData.experienceLevel} experience level and ${
      submissionData.brandTone
    } tone
- NEVER leave any section empty or with placeholder text
- Ensure each section provides immediately actionable business guidance
- Return ONLY the JSON object - no additional text, markdown, or formatting

� CRITICAL: Generate complete content for ALL sections. If ANY section is incomplete, the response is INVALID.
🔥 MANDATORY: Every field must have specific, actionable content. No placeholder text.
🔥 VERIFY: Before responding, ensure Equipment, HR, Financial, Inventory, Marketing, Legal, Partnership, and Scalability sections are ALL complete.

RESPOND WITH COMPLETE JSON ONLY:`;
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

      // Generate the business manual using Gemini AI
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

      return {
        success: true,
        data: submissionDoc.data(),
        submission: submissionDoc.data(),
      };
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
      console.log("Getting submissions for user:", userId);

      // Try without orderBy first to avoid index issues
      const querySnapshot = await db
        .collection(collections.BUSINESS_MANUAL_SUBMISSION)
        .where("userId", "==", userId)
        .limit(limit)
        .get();

      console.log("Found submissions:", querySnapshot.docs.length);

      const submissions = querySnapshot.docs.map((doc) => {
        const data = doc.data();

        // Convert Firebase Timestamps to ISO strings
        const processedData = {
          id: doc.id,
          ...data,
          submittedAt: data.submittedAt
            ? typeof data.submittedAt.toDate === "function"
              ? data.submittedAt.toDate().toISOString()
              : data.submittedAt
            : null,
          createdAt: data.createdAt
            ? typeof data.createdAt.toDate === "function"
              ? data.createdAt.toDate().toISOString()
              : data.createdAt
            : null,
          updatedAt: data.updatedAt
            ? typeof data.updatedAt.toDate === "function"
              ? data.updatedAt.toDate().toISOString()
              : data.updatedAt
            : null,
        };

        console.log("Processed submission data:", processedData);
        return processedData;
      });

      // Sort in memory by submittedAt or createdAt
      submissions.sort((a, b) => {
        const dateA = new Date(a.submittedAt || a.createdAt || 0);
        const dateB = new Date(b.submittedAt || b.createdAt || 0);
        return dateB - dateA;
      });

      return { success: true, data: submissions };
    } catch (error) {
      console.error("Error getting user submissions:", error);
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
   * Get all responses for a user (simplified version without ordering to avoid index requirement)
   */
  static async getUserResponses(userId, limit = 10) {
    try {
      console.log("Getting responses for user:", userId);

      // Simple query without ordering to avoid Firebase index requirement
      const querySnapshot = await db
        .collection(collections.BUSINESS_MANUAL_RESPONSE)
        .where("userId", "==", userId)
        .limit(limit)
        .get();

      if (querySnapshot.empty) {
        console.log("No responses found for user:", userId);
        return {
          success: true,
          data: [],
          responses: [], // For backward compatibility
        };
      }

      const responses = querySnapshot.docs.map((doc) => {
        const data = doc.data();

        // Convert Firebase Timestamps to ISO strings
        const processedData = {
          id: doc.id,
          ...data,
          generatedAt: data.generatedAt
            ? typeof data.generatedAt.toDate === "function"
              ? data.generatedAt.toDate().toISOString()
              : data.generatedAt
            : null,
          createdAt: data.createdAt
            ? typeof data.createdAt.toDate === "function"
              ? data.createdAt.toDate().toISOString()
              : data.createdAt
            : null,
          updatedAt: data.updatedAt
            ? typeof data.updatedAt.toDate === "function"
              ? data.updatedAt.toDate().toISOString()
              : data.updatedAt
            : null,
        };

        console.log("Processed response data:", {
          id: processedData.id,
          businessName: processedData.businessName,
        });
        return processedData;
      });

      // Sort by date
      responses.sort((a, b) => {
        const dateA = new Date(a.generatedAt || a.createdAt || 0);
        const dateB = new Date(b.generatedAt || b.createdAt || 0);
        return dateB - dateA;
      });

      return {
        success: true,
        data: responses,
        responses: responses, // For backward compatibility
      };
    } catch (error) {
      console.error("Error getting user responses:", error);
      return {
        success: false,
        error: error.message,
        code: "FETCH_ERROR",
      };
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

      const submissions = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      return { success: true, data: submissions };
    } catch (error) {
      console.error("Error getting pending submissions:", error);
      return { success: false, error: error.message };
    }
  }
}
