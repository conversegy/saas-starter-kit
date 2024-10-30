const domainRegex =
  /(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]/;

export const isValidDomain = (domain: string): boolean => {
  return domainRegex.test(domain);
};

export const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text);
};

export const defaultHeaders = {
  'Content-Type': 'application/json',
};

export const passwordPolicies = {
  minLength: 8,
};

// List of events used to create webhook endpoint
export const eventTypes = [
  'member.created',
  'member.removed',
  'invitation.created',
  'invitation.removed',
];

export const maxLengthPolicies = {
  name: 64,
  email: 255,
  password: 128,
};
