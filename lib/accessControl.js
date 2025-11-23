// Access Control and Feature Management
import { verifyToken, decodeToken } from './token';

// Define features for each subscription tier
export const FEATURES = {
  free: [
    'basic_analytics_view',
    'content_preview',
    'limited_reports'
  ],
  basic: [
    'basic_analytics_view',
    'advanced_analytics',
    'content_preview',
    'content_creation',
    'standard_reports',
    'export_csv'
  ],
  premium: [
    'basic_analytics_view',
    'advanced_analytics',
    'real_time_analytics',
    'content_preview',
    'content_creation',
    'content_editing',
    'ai_content_generation',
    'standard_reports',
    'advanced_reports',
    'export_csv',
    'export_pdf',
    'custom_reports',
    'api_access'
  ]
};

// Feature descriptions
export const FEATURE_DETAILS = {
  basic_analytics_view: {
    name: 'Basic Analytics',
    description: 'View basic traffic and usage statistics',
    icon: '📊'
  },
  advanced_analytics: {
    name: 'Advanced Analytics',
    description: 'Detailed metrics, trends, and insights',
    icon: '📈'
  },
  real_time_analytics: {
    name: 'Real-time Analytics',
    description: 'Live data updates and monitoring',
    icon: '⚡'
  },
  content_preview: {
    name: 'Content Preview',
    description: 'Preview content before publishing',
    icon: '👁️'
  },
  content_creation: {
    name: 'Content Creation',
    description: 'Create and save content',
    icon: '✍️'
  },
  content_editing: {
    name: 'Advanced Editing',
    description: 'Full content editing capabilities',
    icon: '✏️'
  },
  ai_content_generation: {
    name: 'AI Content Generation',
    description: 'Generate content using AI',
    icon: '🤖'
  },
  limited_reports: {
    name: 'Limited Reports',
    description: 'Basic report viewing (last 7 days)',
    icon: '📄'
  },
  standard_reports: {
    name: 'Standard Reports',
    description: 'Monthly reports with basic metrics',
    icon: '📋'
  },
  advanced_reports: {
    name: 'Advanced Reports',
    description: 'Custom date ranges and detailed metrics',
    icon: '📊'
  },
  export_csv: {
    name: 'CSV Export',
    description: 'Export data to CSV format',
    icon: '📑'
  },
  export_pdf: {
    name: 'PDF Export',
    description: 'Export reports to PDF',
    icon: '📕'
  },
  custom_reports: {
    name: 'Custom Reports',
    description: 'Build custom reports with filters',
    icon: '🔧'
  },
  api_access: {
    name: 'API Access',
    description: 'Programmatic access to your data',
    icon: '🔌'
  }
};

// Get token from storage (client-side)
export function getStoredToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

// Get user from storage (client-side)
export function getStoredUser() {
  if (typeof window === 'undefined') return null;
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
}

// Verify and decode token
export function verifyUserToken(token) {
  if (!token) return { valid: false, error: 'No token provided' };
  
  const verification = verifyToken(token);
  if (!verification.valid) {
    return verification;
  }
  
  const decoded = decodeToken(token);
  if (decoded.error) {
    return { valid: false, error: decoded.error };
  }
  
  return {
    valid: true,
    payload: verification.payload,
    header: decoded.header,
    tier: verification.payload.subscription || 'free'
  };
}

// Check if user has access to a feature
export function hasFeatureAccess(tier, featureId) {
  const tierFeatures = FEATURES[tier?.toLowerCase()] || FEATURES.free;
  return tierFeatures.includes(featureId);
}

// Get all available features for a tier
export function getAvailableFeatures(tier) {
  const tierFeatures = FEATURES[tier?.toLowerCase()] || FEATURES.free;
  return tierFeatures.map(featureId => ({
    id: featureId,
    ...FEATURE_DETAILS[featureId],
    available: true
  }));
}

// Get all features with availability status
export function getAllFeaturesWithAccess(tier) {
  const allFeatureIds = Object.keys(FEATURE_DETAILS);
  const tierFeatures = FEATURES[tier?.toLowerCase()] || FEATURES.free;
  
  return allFeatureIds.map(featureId => ({
    id: featureId,
    ...FEATURE_DETAILS[featureId],
    available: tierFeatures.includes(featureId),
    requiredTier: getRequiredTier(featureId)
  }));
}

// Get minimum tier required for a feature
function getRequiredTier(featureId) {
  if (FEATURES.free.includes(featureId)) return 'free';
  if (FEATURES.basic.includes(featureId)) return 'basic';
  if (FEATURES.premium.includes(featureId)) return 'premium';
  return 'premium';
}

// Get tier comparison
export function getTierComparison() {
  return [
    { tier: 'free', features: FEATURES.free },
    { tier: 'basic', features: FEATURES.basic },
    { tier: 'premium', features: FEATURES.premium }
  ];
}

// Check if upgrade is needed for feature
export function needsUpgrade(currentTier, featureId) {
  const hasAccess = hasFeatureAccess(currentTier, featureId);
  if (hasAccess) return null;
  
  const requiredTier = getRequiredTier(featureId);
  return requiredTier;
}
