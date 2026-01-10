const { database, DB_TYPE, TABLE_NAME } = require('./database');

// Helper function to map database row to GraphQL object
const mapRowToCandidate = (row) => {
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
    // Ensure dates are properly formatted for PostgreSQL
    lastSeenAt: row.last_seen_at ? (row.last_seen_at instanceof Date ? row.last_seen_at.toISOString() : row.last_seen_at) : null,
    savedAt: row.saved_at ? (row.saved_at instanceof Date ? row.saved_at.toISOString() : row.saved_at) : null
  };
};

// PostgreSQL query builders
const buildPostgreSQLCandidatesQuery = (filters) => {
  let query = 'SELECT * FROM cofounder_profiles WHERE 1=1';
  const params = [];
  let paramIndex = 1;

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
    query += ` AND (intro ILIKE $${paramIndex} OR impressive_thing ILIKE $${paramIndex + 1})`;
    params.push(`%${filters.search}%`, `%${filters.search}%`);
    paramIndex += 2;
  }

  if (filters.searchName) {
    query += ` AND (name ILIKE $${paramIndex} OR first_name ILIKE $${paramIndex + 1})`;
    params.push(`%${filters.searchName}%`, `%${filters.searchName}%`);
    paramIndex += 2;
  }

  if (filters.searchCompany) {
    query += ` AND (company_name ILIKE $${paramIndex} OR company_url ILIKE $${paramIndex + 1})`;
    params.push(`%${filters.searchCompany}%`, `%${filters.searchCompany}%`);
    paramIndex += 2;
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

  return { query, params, paramIndex };
};

// Supabase query builder
const buildSupabaseQuery = (filters, selectClause = '*') => {
  let query = database.from(TABLE_NAME);
  
  // Always add a select clause, even if it's just for counting
  if (selectClause === null) {
    // For counting, we still need to select something
    query = query.select('*', { count: 'exact', head: true });
  } else {
    query = query.select(selectClause);
  }

  if (filters.ageMin) {
    query = query.gte('age', filters.ageMin);
  }

  if (filters.ageMax) {
    query = query.lte('age', filters.ageMax);
  }

  if (filters.isWoman !== undefined) {
    query = query.eq('is_woman', filters.isWoman);
  }

  if (filters.isTechnical !== undefined) {
    query = query.eq('is_technical', filters.isTechnical);
  }

  if (filters.location) {
    query = query.ilike('location', `%${filters.location}%`);
  }

  if (filters.country) {
    query = query.ilike('country', `%${filters.country}%`);
  }

  if (filters.region) {
    query = query.ilike('region', `%${filters.region}%`);
  }

  if (filters.timing) {
    query = query.eq('timing', filters.timing);
  }

  if (filters.interests && filters.interests.length > 0) {
    query = query.overlaps('interests', filters.interests);
  }

  if (filters.responsibilities && filters.responsibilities.length > 0) {
    query = query.overlaps('responsibilities', filters.responsibilities);
  }

  if (filters.hasIdea) {
    query = query.eq('has_idea', filters.hasIdea);
  }

  if (filters.hasCf !== undefined) {
    query = query.eq('has_cf', filters.hasCf);
  }

  if (filters.cfIsTechnical !== undefined) {
    query = query.eq('cf_is_technical', filters.cfIsTechnical);
  }

  if (filters.cfLocation) {
    query = query.ilike('cf_location', `%${filters.cfLocation}%`);
  }

  if (filters.cfAgeMin) {
    query = query.gte('cf_age_min', filters.cfAgeMin);
  }

  if (filters.cfAgeMax) {
    query = query.lte('cf_age_max', filters.cfAgeMax);
  }

  if (filters.search) {
    query = query.or(`intro.ilike.%${filters.search}%,impressive_thing.ilike.%${filters.search}%`);
  }

  if (filters.searchName) {
    query = query.or(`name.ilike.%${filters.searchName}%,first_name.ilike.%${filters.searchName}%`);
  }

  if (filters.searchCompany) {
    query = query.or(`company_name.ilike.%${filters.searchCompany}%,company_url.ilike.%${filters.searchCompany}%`);
  }

  if (filters.hasCompany !== undefined) {
    if (filters.hasCompany) {
      query = query.not('company_name', 'is', null).neq('company_name', '');
    } else {
      query = query.or('company_name.is.null,company_name.eq.');
    }
  }

  if (filters.hasCompanyUrl !== undefined) {
    if (filters.hasCompanyUrl) {
      query = query.not('company_url', 'is', null).neq('company_url', '');
    } else {
      query = query.or('company_url.is.null,company_url.eq.');
    }
  }

  return query;
};

const resolvers = {
  Query: {
    candidates: async (_, { filters = {}, limit = 20, offset = 0 }) => {
      if (DB_TYPE === 'supabase') {
        // Supabase implementation
        let query = buildSupabaseQuery(filters, '*');
        query = query
          .order('last_seen_at', { ascending: false })
          .range(offset, offset + limit - 1);

        const { data, error } = await query;

        if (error) {
          throw new Error(`Supabase error: ${error.message}`);
        }

        return data.map(mapRowToCandidate);
      } else {
        // PostgreSQL implementation
        const { query, params, paramIndex } = buildPostgreSQLCandidatesQuery(filters);
        const finalQuery = `${query} ORDER BY last_seen_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
        params.push(limit, offset);

        const result = await database.query(finalQuery, params);
        return result.rows.map(mapRowToCandidate);
      }
    },

    candidate: async (_, { slug }) => {
      if (DB_TYPE === 'supabase') {
        // Supabase implementation
        const { data, error } = await database
          .from(TABLE_NAME)
          .select('*')
          .eq('slug', slug)
          .single();

        if (error) {
          if (error.code === 'PGRST116') return null; // No rows found
          throw new Error(`Supabase error: ${error.message}`);
        }

        return mapRowToCandidate(data);
      } else {
        // PostgreSQL implementation
        const result = await database.query('SELECT * FROM cofounder_profiles WHERE slug = $1', [slug]);
        if (result.rows.length === 0) return null;
        
        return mapRowToCandidate(result.rows[0]);
      }
    },

    candidatesCount: async (_, { filters = {} }) => {
      if (DB_TYPE === 'supabase') {
        // Supabase implementation - build query with filters and count
        let query = buildSupabaseQuery(filters, null); // This will add count automatically

        const { count, error } = await query;

        if (error) {
          throw new Error(`Supabase error: ${error.message}`);
        }

        return count || 0;
      } else {
        // PostgreSQL implementation
        const { query, params } = buildPostgreSQLCandidatesQuery(filters);
        const countQuery = query.replace('SELECT *', 'SELECT COUNT(*)');

        const result = await database.query(countQuery, params);
        return parseInt(result.rows[0].count);
      }
    }
  }
};

module.exports = resolvers;