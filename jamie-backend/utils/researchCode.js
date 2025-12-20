/**
 * Research Code Generation Utility
 * 
 * Purpose: Generate unique anonymous research codes for IRB-compliant data storage
 * 
 * Features:
 * - Generates codes in format: RES-XXXXXX (6 alphanumeric characters)
 * - Ensures uniqueness via database check
 * - Handles collisions with retry logic
 * - Prevents reverse lookup (code → user)
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client with service role key (for admin operations)
// Use lazy initialization to avoid errors if env vars aren't set during module load
let supabase = null;

function getSupabaseClient() {
  if (!supabase) {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase environment variables not configured. SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.');
    }
    
    supabase = createClient(supabaseUrl, supabaseKey);
  }
  return supabase;
}

/**
 * Generate a random research code
 * Format: RES-XXXXXX where X is alphanumeric (excluding confusing chars)
 * 
 * @returns {string} Research code (e.g., "RES-ABC123")
 */
function generateResearchCode() {
  const prefix = 'RES-';
  // Exclude confusing characters: I, O, 0, 1 (to avoid user confusion)
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const randomPart = Array.from({ length: 6 }, () => 
    chars.charAt(Math.floor(Math.random() * chars.length))
  ).join('');
  return prefix + randomPart;
}

/**
 * Check if a research code already exists in the database
 * 
 * @param {string} code - Research code to check
 * @returns {Promise<boolean>} True if code exists, false otherwise
 */
async function codeExists(code) {
  try {
    const { data, error } = await getSupabaseClient()
      .from('research_code_mappings')
      .select('research_code')
      .eq('research_code', code)
      .single();
    
    // If no row found (PGRST116), code doesn't exist
    if (error && error.code === 'PGRST116') {
      return false;
    }
    
    // If other error, log and assume code exists (safer)
    if (error) {
      console.error('Error checking code existence:', error);
      return true; // Assume exists to be safe
    }
    
    // If data returned, code exists
    return !!data;
  } catch (error) {
    console.error('Exception checking code existence:', error);
    return true; // Assume exists on error
  }
}

/**
 * Check if user already has a research code for a character
 * 
 * @param {string} userId - User UUID
 * @param {string} characterName - Character name (should be 'jamie' for research)
 * @returns {Promise<{hasCode: boolean, code: string|null}>}
 */
async function hasResearchCode(userId, characterName = 'jamie') {
  try {
    // Note: This query uses service role, so it can bypass RLS
    // Regular users cannot query this table (RLS blocks SELECT)
    const { data, error } = await getSupabaseClient()
      .from('research_code_mappings')
      .select('research_code')
      .eq('user_id', userId)
      .eq('character_name', characterName)
      .single();
    
    // If no row found, user doesn't have a code yet (first attempt)
    if (error && error.code === 'PGRST116') {
      return { hasCode: false, code: null };
    }
    
    if (error) {
      console.error('Error checking user research code:', error);
      throw error;
    }
    
    // User has a code (not first attempt)
    return { hasCode: true, code: data.research_code };
  } catch (error) {
    console.error('Exception checking user research code:', error);
    throw error;
  }
}

/**
 * Create and store a research code for a user's first attempt
 * 
 * @param {string} userId - User UUID
 * @param {string} characterName - Character name (should be 'jamie' for research)
 * @param {number} maxRetries - Maximum retry attempts for code generation (default: 10)
 * @returns {Promise<string>} Research code
 * @throws {Error} If unable to generate unique code after max retries
 */
async function createResearchCode(userId, characterName = 'jamie', maxRetries = 10) {
  // First, check if user already has a code (not first attempt)
  const { hasCode, code: existingCode } = await hasResearchCode(userId, characterName);
  
  if (hasCode) {
    // User already has a code - return existing code
    console.log(`User ${userId} already has research code: ${existingCode}`);
    return existingCode;
  }
  
  // Generate unique code with retry logic
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const code = generateResearchCode();
    
    // Check if code already exists
    const exists = await codeExists(code);
    
    if (!exists) {
      // Code is unique - try to insert
      try {
        const { data, error } = await getSupabaseClient()
          .from('research_code_mappings')
          .insert({
            user_id: userId,
            research_code: code,
            character_name: characterName
          })
          .select('research_code')
          .single();
        
        if (error) {
          // Check if it's a unique constraint violation (user already has code)
          if (error.code === '23505') {
            // User already has a code - get existing one
            const { hasCode: hasExisting, code: existing } = await hasResearchCode(userId, characterName);
            if (hasExisting) {
              return existing;
            }
          }
          
          // Other error - log and retry
          console.warn(`Failed to insert code on attempt ${attempt + 1}:`, error.message);
          if (attempt < maxRetries - 1) {
            continue; // Retry with new code
          } else {
            throw new Error(`Failed to create research code after ${maxRetries} attempts: ${error.message}`);
          }
        }
        
        // Success!
        console.log(`✅ Created research code: ${code} for user: ${userId}`);
        return code;
        
      } catch (error) {
        // Handle insertion errors
        if (error.code === '23505') {
          // Unique constraint - user might have gotten code from concurrent request
          const { hasCode: hasExisting, code: existing } = await hasResearchCode(userId, characterName);
          if (hasExisting) {
            return existing;
          }
        }
        
        if (attempt < maxRetries - 1) {
          console.warn(`Retrying code generation (attempt ${attempt + 1}/${maxRetries})`);
          continue;
        } else {
          throw new Error(`Failed to create research code after ${maxRetries} attempts: ${error.message}`);
        }
      }
    } else {
      // Code exists, try again
      if (attempt < maxRetries - 1) {
        console.warn(`Code ${code} already exists, generating new code (attempt ${attempt + 1}/${maxRetries})`);
        continue;
      } else {
        throw new Error(`Failed to generate unique research code after ${maxRetries} attempts`);
      }
    }
  }
  
  throw new Error(`Failed to create research code after ${maxRetries} attempts`);
}

/**
 * Validate research code format
 * 
 * @param {string} code - Code to validate
 * @returns {boolean} True if valid format
 */
function isValidResearchCode(code) {
  if (!code || typeof code !== 'string') {
    return false;
  }
  
  // Format: RES-XXXXXX (prefix + 6 alphanumeric chars)
  const pattern = /^RES-[A-Z0-9]{6}$/;
  return pattern.test(code);
}

module.exports = {
  generateResearchCode,
  codeExists,
  hasResearchCode,
  createResearchCode,
  isValidResearchCode
};

