# Prisma Schema Update Instructions

To fix the current errors, you need to update your Prisma schema to include the new fields we added to the Profile model.

## Steps to Update Schema

1. Open your `prisma/schema.prisma` file
2. Add the following fields to the `Profile` model:

```prisma
model Profile {
  // ... existing fields ...

  // New fields
  talpParticipation      Boolean?
  talpType               String?
  talpOther              String?
  jobReadiness           String[]
  businessSupport        String[]
  registrationMode       String?

  // ... existing fields and relations ...
}
```

3. Generate a migration:ππ

```bash
npx prisma migrate dev --name add_new_profile_fields
```

4. Apply the migration to your database:

```bash
npx prisma generate
```

5. After the schema update is complete, go back to the `components/home/personal-information-new.js` file and uncomment the fields in the `onSubmit` function we commented out.

## What This Fixes

This migration adds the following fields to the Profile model:

- **talpParticipation**: Boolean flag to indicate if user participates in TALP
- **talpType**: Type of TALP participation (film, theater, content, other)
- **talpOther**: Specification for "other" TALP type
- **jobReadiness**: Array of job readiness indicators
- **businessSupport**: Array of business support options
- **registrationMode**: Mode of registration (online or learning_train)

Once these fields are added to the schema, the form will be able to save this data to the database.
