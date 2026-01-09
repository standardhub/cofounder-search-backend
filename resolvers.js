const pool = require('./database');

const resolvers = {
  Query: {
    candidates: async (_, { filters = {}, limit = 20, offset = 0 }) => {
      let query = 'SELECT * FROM cofounder_profiles WHERE 1=1';
      const params = [];
      let paramIndex = 1;

      // Build dynamic WHERE clause based on filters
      if (filters.ageMin) {
        query += ` AND age >= $${paramIndex}`;
        params.push(filters.ageMin);
        paramIndex++;
      }

      if (filters.ageMax) {
        query += ` AND age <= $${paramIndex}`;
        params.push(filters.ageMax);
        paramIndex++;
      }

      if (filters.isWoman !== undefined) {
        query += ` AND is_woman = $${paramIndex}`;
        params.push(filters.isWoman);
        paramIndex++;
      }

      if (filters.isTechnical !== undefined) {
        query += ` AND is_technical = $${paramIndex}`;
        params.push(filters.isTechnical);
        paramIndex++;
      }

      if (filters.location) {
        query += ` AND location ILIKE $${paramIndex}`;
        params.push(`%${filters.location}%`);
        paramIndex++;
      }

      if (filters.country) {
        query += ` AND country ILIKE $${paramIndex}`;
        params.push(`%${filters.country}%`);
        paramIndex++;
      }

      if (filters.region) {
        query += ` AND region ILIKE $${paramIndex}`;
        params.push(`%${filters.region}%`);
        paramIndex++;
      }

      if (filters.timing) {
        query += ` AND timing = $${paramIndex}`;
        params.push(filters.timing);
        paramIndex++;
      }

      if (filters.interests && filters.interests.length > 0) {
        query += ` AND interests && $${paramIndex}`;
        params.push(filters.interests);
        paramIndex++;
      }

      if (filters.responsibilities && filters.responsibilities.length > 0) {
        query += ` AND responsibilities && $${paramIndex}`;
        params.push(filters.responsibilities);
        paramIndex++;
      }

      if (filters.hasIdea) {
        query += ` AND has_idea = $${paramIndex}`;
        params.push(filters.hasIdea);
        paramIndex++;
      }

      if (filters.hasCf !== undefined) {
        query += ` AND has_cf = $${paramIndex}`;
        params.push(filters.hasCf);
        paramIndex++;
      }

      if (filters.cfIsTechnical !== undefined) {
        query += ` AND cf_is_technical = $${paramIndex}`;
        params.push(filters.cfIsTechnical);
        paramIndex++;
      }

      if (filters.cfLocation) {
        query += ` AND cf_location ILIKE $${paramIndex}`;
        params.push(`%${filters.cfLocation}%`);
        paramIndex++;
      }

      if (filters.cfAgeMin) {
        query += ` AND cf_age_min >= $${paramIndex}`;
        params.push(filters.cfAgeMin);
        paramIndex++;
      }

      if (filters.cfAgeMax) {
        query += ` AND cf_age_max <= $${paramIndex}`;
        params.push(filters.cfAgeMax);
        paramIndex++;
      }

      if (filters.search) {
        query += ` AND (intro ILIKE $${paramIndex} OR impressive_thing ILIKE $${paramIndex})`;
        params.push(`%${filters.search}%`);
        paramIndex++;
      }

      if (filters.searchName) {
        query += ` AND (name ILIKE $${paramIndex} OR first_name ILIKE $${paramIndex})`;
        params.push(`%${filters.searchName}%`);
        paramIndex++;
      }

      if (filters.searchCompany) {
        query += ` AND (company_name ILIKE $${paramIndex} OR company_url ILIKE $${paramIndex})`;
        params.push(`%${filters.searchCompany}%`);
        paramIndex++;
      }

      if (filters.hasCompany !== undefined) {
        if (filters.hasCompany) {
          query += ` AND (company_name IS NOT NULL AND company_name != '')`;
        } else {
          query += ` AND (company_name IS NULL OR company_name = '')`;
        }
      }

      if (filters.hasCompanyUrl !== undefined) {
        if (filters.hasCompanyUrl) {
          query += ` AND (company_url IS NOT NULL AND company_url != '')`;
        } else {
          query += ` AND (company_url IS NULL OR company_url = '')`;
        }
      }

      query += ` ORDER BY last_seen_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      params.push(limit, offset);

      const result = await pool.query(query, params);
      return result.rows.map(row => ({
        slug: row.slug,
        name: row.name,
        firstName: row.first_name,
        age: row.age,
        isWoman: row.is_woman,
        avatarUrl: row.avatar_url,
        linkedin: row.linkedin,
        education: row.education,
        employment: row.employment,
        isTechnical: row.is_technical,
        location: row.location,
        country: row.country,
        region: row.region,
        timing: row.timing,
        emailSettings: row.email_settings,
        videoLink: row.video_link,
        calendlyLink: row.calendly_link,
        intro: row.intro,
        impressiveThing: row.impressive_thing,
        interests: row.interests,
        responsibilities: row.responsibilities,
        companyName: row.company_name,
        companyUrl: row.company_url,
        hasIdea: row.has_idea,
        ideas: row.ideas,
        hasCf: row.has_cf,
        currentCfLinkedin: row.current_cf_linkedin,
        currentCfTechnical: row.current_cf_technical,
        reqFreeText: row.req_free_text,
        equity: row.equity,
        cfHasIdea: row.cf_has_idea,
        cfHasIdeaImportance: row.cf_has_idea_importance,
        cfIsTechnical: row.cf_is_technical,
        cfIsTechnicalImportance: row.cf_is_technical_importance,
        cfResponsibilities: row.cf_responsibilities,
        cfResponsibilitiesImportance: row.cf_responsibilities_importance,
        cfLocation: row.cf_location,
        cfLocationImportance: row.cf_location_importance,
        cfLocationKmRange: row.cf_location_km_range,
        cfAgeMin: row.cf_age_min,
        cfAgeMax: row.cf_age_max,
        cfAgeImportance: row.cf_age_importance,
        cfTimingImportance: row.cf_timing_importance,
        cfInterestsImportance: row.cf_interests_importance,
        lastSeenAt: row.last_seen_at,
        savedAt: row.saved_at
      }));
    },

    candidate: async (_, { slug }) => {
      const result = await pool.query('SELECT * FROM cofounder_profiles WHERE slug = $1', [slug]);
      if (result.rows.length === 0) return null;
      
      const row = result.rows[0];
      return {
        slug: row.slug,
        name: row.name,
        firstName: row.first_name,
        age: row.age,
        isWoman: row.is_woman,
        avatarUrl: row.avatar_url,
        linkedin: row.linkedin,
        education: row.education,
        employment: row.employment,
        isTechnical: row.is_technical,
        location: row.location,
        country: row.country,
        region: row.region,
        timing: row.timing,
        emailSettings: row.email_settings,
        videoLink: row.video_link,
        calendlyLink: row.calendly_link,
        intro: row.intro,
        impressiveThing: row.impressive_thing,
        interests: row.interests,
        responsibilities: row.responsibilities,
        companyName: row.company_name,
        companyUrl: row.company_url,
        hasIdea: row.has_idea,
        ideas: row.ideas,
        hasCf: row.has_cf,
        currentCfLinkedin: row.current_cf_linkedin,
        currentCfTechnical: row.current_cf_technical,
        reqFreeText: row.req_free_text,
        equity: row.equity,
        cfHasIdea: row.cf_has_idea,
        cfHasIdeaImportance: row.cf_has_idea_importance,
        cfIsTechnical: row.cf_is_technical,
        cfIsTechnicalImportance: row.cf_is_technical_importance,
        cfResponsibilities: row.cf_responsibilities,
        cfResponsibilitiesImportance: row.cf_responsibilities_importance,
        cfLocation: row.cf_location,
        cfLocationImportance: row.cf_location_importance,
        cfLocationKmRange: row.cf_location_km_range,
        cfAgeMin: row.cf_age_min,
        cfAgeMax: row.cf_age_max,
        cfAgeImportance: row.cf_age_importance,
        cfTimingImportance: row.cf_timing_importance,
        cfInterestsImportance: row.cf_interests_importance,
        lastSeenAt: row.last_seen_at,
        savedAt: row.saved_at
      };
    },

    candidatesCount: async (_, { filters = {} }) => {
      let query = 'SELECT COUNT(*) FROM cofounder_profiles WHERE 1=1';
      const params = [];
      let paramIndex = 1;

      // Apply same filters as in candidates query
      if (filters.ageMin) {
        query += ` AND age >= $${paramIndex}`;
        params.push(filters.ageMin);
        paramIndex++;
      }

      if (filters.ageMax) {
        query += ` AND age <= $${paramIndex}`;
        params.push(filters.ageMax);
        paramIndex++;
      }

      if (filters.isWoman !== undefined) {
        query += ` AND is_woman = $${paramIndex}`;
        params.push(filters.isWoman);
        paramIndex++;
      }

      if (filters.isTechnical !== undefined) {
        query += ` AND is_technical = $${paramIndex}`;
        params.push(filters.isTechnical);
        paramIndex++;
      }

      if (filters.location) {
        query += ` AND location ILIKE $${paramIndex}`;
        params.push(`%${filters.location}%`);
        paramIndex++;
      }

      if (filters.country) {
        query += ` AND country ILIKE $${paramIndex}`;
        params.push(`%${filters.country}%`);
        paramIndex++;
      }

      if (filters.region) {
        query += ` AND region ILIKE $${paramIndex}`;
        params.push(`%${filters.region}%`);
        paramIndex++;
      }

      if (filters.timing) {
        query += ` AND timing = $${paramIndex}`;
        params.push(filters.timing);
        paramIndex++;
      }

      if (filters.interests && filters.interests.length > 0) {
        query += ` AND interests && $${paramIndex}`;
        params.push(filters.interests);
        paramIndex++;
      }

      if (filters.responsibilities && filters.responsibilities.length > 0) {
        query += ` AND responsibilities && $${paramIndex}`;
        params.push(filters.responsibilities);
        paramIndex++;
      }

      if (filters.hasIdea) {
        query += ` AND has_idea = $${paramIndex}`;
        params.push(filters.hasIdea);
        paramIndex++;
      }

      if (filters.hasCf !== undefined) {
        query += ` AND has_cf = $${paramIndex}`;
        params.push(filters.hasCf);
        paramIndex++;
      }

      if (filters.cfIsTechnical !== undefined) {
        query += ` AND cf_is_technical = $${paramIndex}`;
        params.push(filters.cfIsTechnical);
        paramIndex++;
      }

      if (filters.cfLocation) {
        query += ` AND cf_location ILIKE $${paramIndex}`;
        params.push(`%${filters.cfLocation}%`);
        paramIndex++;
      }

      if (filters.search) {
        query += ` AND (intro ILIKE $${paramIndex} OR impressive_thing ILIKE $${paramIndex})`;
        params.push(`%${filters.search}%`);
        paramIndex++;
      }

      if (filters.searchName) {
        query += ` AND (name ILIKE $${paramIndex} OR first_name ILIKE $${paramIndex})`;
        params.push(`%${filters.searchName}%`);
        paramIndex++;
      }

      if (filters.searchCompany) {
        query += ` AND (company_name ILIKE $${paramIndex} OR company_url ILIKE $${paramIndex})`;
        params.push(`%${filters.searchCompany}%`);
        paramIndex++;
      }

      if (filters.hasCompany !== undefined) {
        if (filters.hasCompany) {
          query += ` AND (company_name IS NOT NULL AND company_name != '')`;
        } else {
          query += ` AND (company_name IS NULL OR company_name = '')`;
        }
      }

      if (filters.hasCompanyUrl !== undefined) {
        if (filters.hasCompanyUrl) {
          query += ` AND (company_url IS NOT NULL AND company_url != '')`;
        } else {
          query += ` AND (company_url IS NULL OR company_url = '')`;
        }
      }

      const result = await pool.query(query, params);
      return parseInt(result.rows[0].count);
    }
  }
};

module.exports = resolvers;