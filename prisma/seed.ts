import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // ============================================
  // 1. Create Admin User with Better Auth
  // ============================================
  console.log("👤 Creating admin user...");
  const hashedPassword = await bcrypt.hash("password123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      emailVerified: true,
      name: "Administrateur",
      role: UserRole.ADMINISTRATOR,
      active: true,
    },
  });

  // Create Better Auth account with password
  await prisma.account.upsert({
    where: {
      providerId_accountId: {
        providerId: "credential",
        accountId: admin.email,
      },
    },
    update: {},
    create: {
      userId: admin.id,
      accountId: admin.email,
      providerId: "credential",
      password: hashedPassword,
    },
  });

  console.log(`✅ Admin user created: ${admin.email} (password: password123)`);

  // ============================================
  // 2. Create Categories (Hierarchical)
  // ============================================
  console.log("📂 Creating categories...");

  const electronicsCategory = await prisma.category.upsert({
    where: { id: "electronics-parent" },
    update: {},
    create: {
      id: "electronics-parent",
      name: "Électronique",
      description: "Produits électroniques et accessoires",
      active: true,
    },
  });

  const computersCategory = await prisma.category.upsert({
    where: { id: "computers-child" },
    update: {},
    create: {
      id: "computers-child",
      name: "Ordinateurs",
      description: "Ordinateurs portables et de bureau",
      parentId: electronicsCategory.id,
      active: true,
    },
  });

  const officeCategory = await prisma.category.upsert({
    where: { id: "office-parent" },
    update: {},
    create: {
      id: "office-parent",
      name: "Fournitures de bureau",
      description: "Matériel et fournitures de bureau",
      active: true,
    },
  });

  console.log(`✅ Created 3 categories (1 with hierarchy)`);

  // ============================================
  // 3. Create Main Warehouse
  // ============================================
  console.log("🏢 Creating main warehouse...");
  const mainWarehouse = await prisma.warehouse.upsert({
    where: { code: "WH-MAIN" },
    update: {},
    create: {
      code: "WH-MAIN",
      name: "Entrepôt Principal",
      address: "123 Rue de la Logistique",
      city: "Paris",
      country: "France",
      active: true,
    },
  });
  console.log(`✅ Warehouse created: ${mainWarehouse.name} (${mainWarehouse.code})`);

  // Grant admin full access to main warehouse
  await prisma.warehouseAccess.upsert({
    where: {
      userId_warehouseId: {
        userId: admin.id,
        warehouseId: mainWarehouse.id,
      },
    },
    update: {},
    create: {
      userId: admin.id,
      warehouseId: mainWarehouse.id,
      canWrite: true,
    },
  });
  console.log(`✅ Admin granted access to ${mainWarehouse.name}`);

  // ============================================
  // 4. Create Products with Variants
  // ============================================
  console.log("📦 Creating products...");

  // Product 1: Laptop with variants
  const laptop = await prisma.product.upsert({
    where: { sku: "LAPTOP-001" },
    update: {},
    create: {
      sku: "LAPTOP-001",
      name: "Ordinateur Portable Pro",
      description: "Ordinateur portable haute performance pour professionnels",
      categoryId: computersCategory.id,
      unit: "pièce",
      minStock: 5,
      createdBy: admin.id,
      active: true,
    },
  });

  const laptopVariant16GB = await prisma.productVariant.upsert({
    where: { sku: "LAPTOP-001-16GB" },
    update: {},
    create: {
      productId: laptop.id,
      name: "16GB RAM / 512GB SSD",
      sku: "LAPTOP-001-16GB",
      attributes: {
        ram: "16GB",
        storage: "512GB SSD",
        color: "Silver",
      },
      active: true,
    },
  });

  const laptopVariant32GB = await prisma.productVariant.upsert({
    where: { sku: "LAPTOP-001-32GB" },
    update: {},
    create: {
      productId: laptop.id,
      name: "32GB RAM / 1TB SSD",
      sku: "LAPTOP-001-32GB",
      attributes: {
        ram: "32GB",
        storage: "1TB SSD",
        color: "Space Gray",
      },
      active: true,
    },
  });

  console.log(`✅ Product created: ${laptop.name} with 2 variants`);

  // Product 2: Office Chair
  const chair = await prisma.product.upsert({
    where: { sku: "CHAIR-001" },
    update: {},
    create: {
      sku: "CHAIR-001",
      name: "Chaise de Bureau Ergonomique",
      description: "Chaise ergonomique avec support lombaire",
      categoryId: officeCategory.id,
      unit: "pièce",
      minStock: 10,
      createdBy: admin.id,
      active: true,
    },
  });

  await prisma.productAttribute.createMany({
    data: [
      { productId: chair.id, name: "Couleur", value: "Noir" },
      { productId: chair.id, name: "Matériau", value: "Mesh" },
      { productId: chair.id, name: "Hauteur réglable", value: "Oui" },
    ],
    skipDuplicates: true,
  });

  console.log(`✅ Product created: ${chair.name} with 3 attributes`);

  // Product 3: Mouse
  const mouse = await prisma.product.upsert({
    where: { sku: "MOUSE-001" },
    update: {},
    create: {
      sku: "MOUSE-001",
      name: "Souris Sans Fil",
      description: "Souris ergonomique sans fil avec batterie longue durée",
      categoryId: electronicsCategory.id,
      unit: "pièce",
      minStock: 20,
      createdBy: admin.id,
      active: true,
    },
  });

  console.log(`✅ Product created: ${mouse.name}`);

  // ============================================
  // 5. Create Initial Stock
  // ============================================
  console.log("📊 Creating initial stock...");

  await prisma.stock.upsert({
    where: {
      warehouseId_productId_variantId: {
        warehouseId: mainWarehouse.id,
        productId: laptop.id,
        variantId: laptopVariant16GB.id,
      },
    },
    update: {},
    create: {
      warehouseId: mainWarehouse.id,
      productId: laptop.id,
      variantId: laptopVariant16GB.id,
      quantity: 15,
      reservedQty: 0,
    },
  });

  await prisma.stock.upsert({
    where: {
      warehouseId_productId_variantId: {
        warehouseId: mainWarehouse.id,
        productId: laptop.id,
        variantId: laptopVariant32GB.id,
      },
    },
    update: {},
    create: {
      warehouseId: mainWarehouse.id,
      productId: laptop.id,
      variantId: laptopVariant32GB.id,
      quantity: 8,
      reservedQty: 0,
    },
  });

  // For products without variants, use findFirst + create or update
  const existingChairStock = await prisma.stock.findFirst({
    where: {
      warehouseId: mainWarehouse.id,
      productId: chair.id,
      variantId: null,
    },
  });

  if (!existingChairStock) {
    await prisma.stock.create({
      data: {
        warehouseId: mainWarehouse.id,
        productId: chair.id,
        variantId: null,
        quantity: 25,
        reservedQty: 0,
      },
    });
  }

  const existingMouseStock = await prisma.stock.findFirst({
    where: {
      warehouseId: mainWarehouse.id,
      productId: mouse.id,
      variantId: null,
    },
  });

  if (!existingMouseStock) {
    await prisma.stock.create({
      data: {
        warehouseId: mainWarehouse.id,
        productId: mouse.id,
        variantId: null,
        quantity: 50,
        reservedQty: 0,
      },
    });
  }

  console.log(`✅ Stock created for all products`);

  // ============================================
  // Summary
  // ============================================
  console.log("\n🎉 Database seed completed successfully!");
  console.log("\n📋 Summary:");
  console.log(`   👤 Users: 1 (admin@example.com)`);
  console.log(`   📂 Categories: 3 (hierarchical)`);
  console.log(`   🏢 Warehouses: 1 (WH-MAIN)`);
  console.log(`   📦 Products: 3 (with variants and attributes)`);
  console.log(`   📊 Stock entries: 4`);
  console.log(`\n🔐 Login credentials:`);
  console.log(`   Email: admin@example.com`);
  console.log(`   Password: password123`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Seed failed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
