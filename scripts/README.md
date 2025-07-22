# Employee Creation Scripts

This directory contains scripts to create test employees for the Chat Appraisal Insights application.

## Scripts

### 1. Basic Employee Creation (`create-employees.js`)

Creates 5 basic employees with the following credentials:

- **Password**: `password` (for all users)
- **Role**: `employee` (for all users)

**Employees created:**

1. John Doe (john.doe@company.com) - Engineering
2. Jane Smith (jane.smith@company.com) - Marketing
3. Mike Johnson (mike.johnson@company.com) - Sales
4. Sarah Wilson (sarah.wilson@company.com) - HR
5. David Brown (david.brown@company.com) - Finance

### 2. Advanced Employee Creation (`create-employees-advanced.js`)

Creates 8 employees with additional features:

- Duplicate checking
- Better error handling
- Command line options
- Detailed reporting

**Additional employees:** 6. Emma Davis (emma.davis@company.com) - Product 7. Alex Garcia (alex.garcia@company.com) - Design 8. Lisa Martinez (lisa.martinez@company.com) - Operations

## Usage

### Basic Script

```bash
npm run create-employees
```

### Advanced Script

```bash
# Create all employees
npm run create-employees:advanced

# Show help
npm run create-employees:advanced -- --help

# Dry run (show what would be created)
npm run create-employees:advanced -- --dry-run

# Create only 3 employees
npm run create-employees:advanced -- --count=3
```

## Features

### Advanced Script Features

- **Duplicate Detection**: Checks if users already exist before creating
- **Rate Limiting**: Adds delays between requests to avoid API limits
- **Error Handling**: Comprehensive error reporting and recovery
- **Progress Tracking**: Shows progress during creation
- **Detailed Summary**: Provides detailed success/failure statistics
- **Command Line Options**: Flexible usage with various options

### Login Credentials

All created employees use:

- **Password**: `password`
- **Role**: `employee`

## Notes

1. **Email Verification**: Users may need to verify their email addresses
2. **Supabase Auth**: Uses Supabase Auth for user creation
3. **Database Trigger**: Automatically creates user profiles via database trigger
4. **Rate Limiting**: Includes delays to respect API rate limits

## Troubleshooting

### Common Issues

1. **"User already exists"**: The user was already created in a previous run
2. **"Invalid email"**: Check email format in the script
3. **"Rate limit exceeded"**: Wait a few minutes and try again
4. **"Network error"**: Check internet connection and Supabase status

### Error Recovery

The advanced script includes error recovery:

- Continues processing even if some users fail
- Provides detailed error messages
- Shows summary of successes and failures
- Allows partial completion

## Security Notes

⚠️ **Important**: These scripts are for development/testing only:

- Uses simple passwords (`password`)
- Creates test email addresses
- Should not be used in production
- Consider using environment variables for sensitive data in production
