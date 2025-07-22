import { createClient } from "@supabase/supabase-js";

// Supabase configuration
const SUPABASE_URL = "https://afotusbousojuugwfkib.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmb3R1c2JvdXNvanV1Z3dma2liIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2NTcwNzYsImV4cCI6MjA2ODIzMzA3Nn0.U3Q7Qjxcf9guOhw9uBZIWSQVCxgQO7NDIhKNDveLRik";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Employee data
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
];

async function createEmployee(employeeData) {
  try {
    console.log(
      `Creating employee: ${employeeData.first_name} ${employeeData.last_name}`
    );

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
        `Error creating ${employeeData.first_name}:`,
        error.message
      );
      return false;
    }

    console.log(
      `✅ Successfully created: ${employeeData.first_name} ${employeeData.last_name} (${employeeData.email})`
    );
    return true;
  } catch (error) {
    console.error(`Error creating ${employeeData.first_name}:`, error.message);
    return false;
  }
}

async function createAllEmployees() {
  console.log("🚀 Starting employee creation process...\n");

  let successCount = 0;
  let failureCount = 0;

  for (const employee of employees) {
    const success = await createEmployee(employee);
    if (success) {
      successCount++;
    } else {
      failureCount++;
    }

    // Add a small delay between requests
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  console.log("\n📊 Summary:");
  console.log(`✅ Successful: ${successCount}`);
  console.log(`❌ Failed: ${failureCount}`);
  console.log(`📧 Total attempted: ${employees.length}`);

  if (successCount > 0) {
    console.log("\n🎉 Employee creation completed!");
    console.log("📝 Note: Users may need to verify their email addresses.");
  }
}

// Run the script
createAllEmployees().catch(console.error);
