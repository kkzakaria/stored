import { PrismaClient, UserRole } from "@prisma/client";

const prisma = new PrismaClient();

const BETTER_AUTH_URL = process.env.BETTER_AUTH_URL || "http://localhost:3002";

interface TestUser {
  email: string;
  name: string;
  password: string;
  role: UserRole;
  active: boolean;
}

const TEST_USERS: TestUser[] = [
  {
    email: "admin@example.com",
    name: "Admin Principal",
    password: "Admin123!@#",
    role: UserRole.ADMINISTRATOR,
    active: true,
  },
  {
    email: "manager@example.com",
    name: "Manager Paris",
    password: "Manager123!@#",
    role: UserRole.MANAGER,
    active: true,
  },
  {
    email: "user@example.com",
    name: "Utilisateur Standard",
    password: "User123!@#",
    role: UserRole.USER,
    active: true,
  },
  {
    email: "visitor-admin@example.com",
    name: "Visiteur Administrateur",
    password: "VisitorAdmin123!@#",
    role: UserRole.VISITOR_ADMIN,
    active: true,
  },
  {
    email: "visitor@example.com",
    name: "Visiteur Standard",
    password: "Visitor123!@#",
    role: UserRole.VISITOR,
    active: true,
  },
];

interface CreateUserResponse {
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
  error?: string;
  session?: unknown;
}

async function createUserViaAuth(user: TestUser): Promise<string | null> {
  try {
    console.log(`Creating user: ${user.email}`);

    const response = await fetch(`${BETTER_AUTH_URL}/api/auth/sign-up/email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: user.email,
        password: user.password,
        name: user.name,
        role: user.role,
        active: user.active,
      }),
    });

    const data = (await response.json()) as CreateUserResponse;

    if (!response.ok) {
      console.error(`❌ Failed to create ${user.email}:`, data.error || response.statusText);
      return null;
    }

    if (data.user) {
      console.log(`✅ Created: ${user.email} (${user.role})`);
      return data.user.id;
    }

    return null;
  } catch (error) {
    console.error(`❌ Error creating ${user.email}:`, error);
    return null;
  }
}

async function createTestWarehouses() {
  console.log("\n🏢 Creating test warehouses...");

  const warehouses = [
    {
      code: "WH-PARIS",
      name: "Entrepôt Paris",
      address: "123 Avenue des Champs-Élysées, 75008",
      city: "Paris",
      country: "France",
      active: true,
    },
    {
      code: "WH-LYON",
      name: "Entrepôt Lyon",
      address: "45 Rue de la République, 69002",
      city: "Lyon",
      country: "France",
      active: true,
    },
    {
      code: "WH-MARSEILLE",
      name: "Entrepôt Marseille",
      address: "78 La Canebière, 13001",
      city: "Marseille",
      country: "France",
      active: true,
    },
  ];

  const createdWarehouses = [];

  for (const warehouse of warehouses) {
    const created = await prisma.warehouse.upsert({
      where: { code: warehouse.code },
      update: warehouse,
      create: warehouse,
    });
    createdWarehouses.push(created);
    console.log(`✅ Created warehouse: ${created.name} (${created.code})`);
  }

  return createdWarehouses;
}

async function assignWarehouseAccess(
  userId: string,
  warehouseId: string,
  canWrite: boolean
) {
  await prisma.warehouseAccess.upsert({
    where: {
      userId_warehouseId: {
        userId,
        warehouseId,
      },
    },
    update: { canWrite },
    create: {
      userId,
      warehouseId,
      canWrite,
    },
  });
}

async function main() {
  console.log("🌱 Starting test user creation...\n");

  // Create warehouses first
  const warehouses = await createTestWarehouses();
  const [whParis, whLyon, whMarseille] = warehouses;

  console.log("\n👤 Creating users via Better Auth...");

  // Create users
  const userIds: Record<string, string> = {};

  for (const testUser of TEST_USERS) {
    const userId = await createUserViaAuth(testUser);
    if (userId) {
      userIds[testUser.email] = userId;
    }
    // Small delay to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 200));
  }

  console.log("\n🔐 Assigning warehouse access...");

  // ADMINISTRATOR - Already has global access, but we'll assign explicitly for testing
  if (userIds["admin@example.com"]) {
    await assignWarehouseAccess(userIds["admin@example.com"], whParis.id, true);
    await assignWarehouseAccess(userIds["admin@example.com"], whLyon.id, true);
    await assignWarehouseAccess(userIds["admin@example.com"], whMarseille.id, true);
    console.log("✅ Admin: Full access to all warehouses");
  }

  // MANAGER - Access to Paris and Lyon with write permissions
  if (userIds["manager@example.com"]) {
    await assignWarehouseAccess(userIds["manager@example.com"], whParis.id, true);
    await assignWarehouseAccess(userIds["manager@example.com"], whLyon.id, true);
    console.log("✅ Manager: Write access to Paris and Lyon");
  }

  // USER - Access to Paris only with write permissions
  if (userIds["user@example.com"]) {
    await assignWarehouseAccess(userIds["user@example.com"], whParis.id, true);
    console.log("✅ User: Write access to Paris only");
  }

  // VISITOR_ADMIN - Read-only, global access (no explicit assignment needed)
  console.log("✅ Visitor Admin: Read-only access to all warehouses (global)");

  // VISITOR - Read-only access to Paris only
  if (userIds["visitor@example.com"]) {
    await assignWarehouseAccess(userIds["visitor@example.com"], whParis.id, false);
    console.log("✅ Visitor: Read-only access to Paris only");
  }

  console.log("\n🎉 Test users created successfully!");
  console.log("\n📋 Summary:");
  console.log(`   👤 Users created: ${Object.keys(userIds).length}`);
  console.log(`   🏢 Warehouses: ${warehouses.length}`);
  console.log("\n🔐 Login Credentials:");
  console.log("   ┌─────────────────────────────┬──────────────────────┐");
  console.log("   │ Email                       │ Password             │");
  console.log("   ├─────────────────────────────┼──────────────────────┤");
  TEST_USERS.forEach((user) => {
    console.log(
      `   │ ${user.email.padEnd(27)} │ ${user.password.padEnd(20)} │`
    );
  });
  console.log("   └─────────────────────────────┴──────────────────────┘");

  console.log("\n📊 Warehouse Access Matrix:");
  console.log("   ┌────────────────────┬────────┬────────┬───────────┐");
  console.log("   │ Role               │ Paris  │ Lyon   │ Marseille │");
  console.log("   ├────────────────────┼────────┼────────┼───────────┤");
  console.log("   │ ADMINISTRATOR      │ RW     │ RW     │ RW        │");
  console.log("   │ MANAGER            │ RW     │ RW     │ -         │");
  console.log("   │ USER               │ RW     │ -      │ -         │");
  console.log("   │ VISITOR_ADMIN      │ R      │ R      │ R         │");
  console.log("   │ VISITOR            │ R      │ -      │ -         │");
  console.log("   └────────────────────┴────────┴────────┴───────────┘");
  console.log("   (RW = Read/Write, R = Read-only, - = No access)\n");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Script failed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
