const { gql } = require('apollo-server-express');

const typeDefs = gql`
  type CofounderProfile {
    slug: String!
    name: String
    firstName: String
    age: Int
    isWoman: Boolean
    avatarUrl: String
    linkedin: String
    education: String
    employment: String
    isTechnical: Boolean
    location: String
    country: String
    region: String
    timing: String
    emailSettings: [String]
    videoLink: String
    calendlyLink: String
    intro: String
    impressiveThing: String
    interests: [String]
    responsibilities: [String]
    companyName: String
    companyUrl: String
    hasIdea: String
    ideas: String
    hasCf: Boolean
    currentCfLinkedin: String
    currentCfTechnical: String
    reqFreeText: String
    equity: String
    cfHasIdea: Boolean
    cfHasIdeaImportance: String
    cfIsTechnical: Boolean
    cfIsTechnicalImportance: String
    cfResponsibilities: [String]
    cfResponsibilitiesImportance: String
    cfLocation: String
    cfLocationImportance: String
    cfLocationKmRange: Int
    cfAgeMin: Int
    cfAgeMax: Int
    cfAgeImportance: String
    cfTimingImportance: String
    cfInterestsImportance: String
    lastSeenAt: String
    savedAt: String
  }

  input FilterInput {
    ageMin: Int
    ageMax: Int
    isWoman: Boolean
    isTechnical: Boolean
    location: String
    country: String
    region: String
    timing: String
    interests: [String]
    responsibilities: [String]
    hasIdea: String
    hasCf: Boolean
    hasCompany: Boolean
    hasCompanyUrl: Boolean
    cfIsTechnical: Boolean
    cfLocation: String
    cfAgeMin: Int
    cfAgeMax: Int
    cfLocationKmRange: Int
    search: String
    searchName: String
    searchCompany: String
  }

  type Query {
    candidates(filters: FilterInput, limit: Int, offset: Int): [CofounderProfile]
    candidate(slug: String!): CofounderProfile
    candidatesCount(filters: FilterInput): Int
  }
`;

module.exports = typeDefs;