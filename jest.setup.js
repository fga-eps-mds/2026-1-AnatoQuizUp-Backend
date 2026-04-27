process.env.NODE_ENV ||= "test";
process.env.DATABASE_URL ||=
  "postgresql://postgres:postgres@localhost:5432/postgres?schema=public";
process.env.JWT_SECRET_KEY ||= "test-secret";
process.env.JWT_REFRESH_SECRET_KEY ||= "test-refresh-secret";
process.env.JWT_PASSWORD_REDEFINITION_SECRET_KEY ||= "test-password-redefinition-secret";
