import { createClient } from "@supabase/supabase-js";

// Supabase configuration
const SUPABASE_URL = "https://afotusbousojuugwfkib.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmb3R1c2JvdXNvanV1Z3dma2liIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2NTcwNzYsImV4cCI6MjA2ODIzMzA3Nn0.U3Q7Qjxcf9guOhw9uBZIWSQVCxgQO7NDIhKNDveLRik";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Employee data with more variety
const employees = [
  {
    email: "john.doe@company.com",
    password: "password",
    first_name: "John",
    last_name: "Doe",
    role: "employee",
    department: "Engineering",
  },
  {
    email: "jane.smith@company.com",
    password: "password",
    first_name: "Jane",
    last_name: "Smith",
    role: "employee",
    department: "Marketing",
  },
  {
    email: "mike.johnson@company.com",
    password: "password",
    first_name: "Mike",
    last_name: "Johnson",
    role: "employee",
    department: "Sales",
  },
  {
    email: "sarah.wilson@company.com",
    password: "password",
    first_name: "Sarah",
    last_name: "Wilson",
    role: "employee",
    department: "HR",
  },
  {
    email: "david.brown@company.com",
    password: "password",
    first_name: "David",
    last_name: "Brown",
    role: "employee",
    department: "Finance",
  },
  {
    email: "emma.davis@company.com",
    password: "password",
    first_name: "Emma",
    last_name: "Davis",
    role: "employee",
    department: "Product",
  },
  {
    email: "alex.garcia@company.com",
    password: "password",
    first_name: "Alex",
    last_name: "Garcia",
    role: "employee",
    department: "Design",
  },
  {
    email: "lisa.martinez@company.com",
    password: "password",
    first_name: "Lisa",
    last_name: "Martinez",
    role: "employee",
    department: "Operations",
  },
];

async function checkExistingUser(email) {
  try {
    const { data, error } = await supabase.auth.admin.listUsers();
    if (error) {
      console.error("Error checking existing users:", error.message);
      return false;
    }

    return data.users.some((user) => user.email === email);
  } catch (error) {
    console.error("Error checking existing user:", error.message);
    return false;
  }
}

async function createEmployee(employeeData, index) {
  try {
    console.log(
      `[${index + 1}/${employees.length}] Creating employee: ${
        employeeData.first_name
      } ${employeeData.last_name}`
    );

    // Check if user already exists
    const exists = await checkExistingUser(employeeData.email);
    if (exists) {
      console.log(`⚠️  User ${employeeData.email} already exists, skipping...`);
      return { success: false, reason: "already_exists" };
    }

    const { data, error } = await supabase.auth.signUp({
      email: employeeData.email,
      password: employeeData.password,
      options: {
        data: {
          first_name: employeeData.first_name,
          last_name: employeeData.last_name,
          role: employeeData.role,
          department: employeeData.department,
        },
      },
    });

    if (error) {
      console.error(
        `❌ Error creating ${employeeData.first_name}:`,
        error.message
      );
      return { success: false, reason: error.message };
    }

    console.log(
      `✅ Successfully created: ${employeeData.first_name} ${employeeData.last_name} (${employeeData.email})`
    );
    return { success: true, data };
  } catch (error) {
    console.error(
      `❌ Error creating ${employeeData.first_name}:`,
      error.message
    );
    return { success: false, reason: error.message };
  }
}

async function createAllEmployees() {
  console.log("🚀 Starting employee creation process...\n");
  console.log(`📋 Total employees to create: ${employees.length}\n`);

  const results = {
    successful: 0,
    failed: 0,
    alreadyExists: 0,
    errors: [],
  };

  for (let i = 0; i < employees.length; i++) {
    const employee = employees[i];
    const result = await createEmployee(employee, i);

    if (result.success) {
      results.successful++;
    } else {
      if (result.reason === "already_exists") {
        results.alreadyExists++;
      } else {
        results.failed++;
        results.errors.push({
          employee: `${employee.first_name} ${employee.last_name}`,
          email: employee.email,
          error: result.reason,
        });
      }
    }

    // Add a small delay between requests to avoid rate limiting
    if (i < employees.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 1500));
    }
  }

  // Print summary
  console.log("\n📊 Summary:");
  console.log(`✅ Successful: ${results.successful}`);
  console.log(`⚠️  Already exists: ${results.alreadyExists}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`📧 Total attempted: ${employees.length}`);

  if (results.errors.length > 0) {
    console.log("\n❌ Errors:");
    results.errors.forEach((error) => {
      console.log(`  - ${error.employee} (${error.email}): ${error.error}`);
    });
  }

  if (results.successful > 0) {
    console.log("\n🎉 Employee creation completed!");
    console.log("📝 Note: Users may need to verify their email addresses.");
    console.log("\n📧 Login credentials:");
    employees.forEach((emp) => {
      console.log(`  - ${emp.email} / password`);
    });
  }

  return results;
}

// Handle command line arguments
const args = process.argv.slice(2);
const command = args[0];

if (command === "--help" || command === "-h") {
  console.log(`
Usage: node scripts/create-employees-advanced.js [options]

Options:
  --help, -h     Show this help message
  --dry-run      Show what would be created without actually creating
  --count N      Create only N employees (default: all)

Examples:
  node scripts/create-employees-advanced.js
  node scripts/create-employees-advanced.js --dry-run
  node scripts/create-employees-advanced.js --count 3
`);
  process.exit(0);
}

if (command === "--dry-run") {
  console.log("🔍 DRY RUN MODE - No employees will be created\n");
  console.log("📋 Employees that would be created:");
  employees.forEach((emp, index) => {
    console.log(
      `  ${index + 1}. ${emp.first_name} ${emp.last_name} (${emp.email}) - ${
        emp.department
      }`
    );
  });
  console.log(`\n📧 Total: ${employees.length} employees`);
  process.exit(0);
}

const countArg = args.find((arg) => arg.startsWith("--count="));
if (countArg) {
  const count = parseInt(countArg.split("=")[1]);
  if (count && count > 0 && count <= employees.length) {
    employees.splice(count);
    console.log(`📋 Creating only ${count} employees...\n`);
  }
}

// Run the script
createAllEmployees().catch((error) => {
  console.error("💥 Fatal error:", error.message);
  process.exit(1);
});
