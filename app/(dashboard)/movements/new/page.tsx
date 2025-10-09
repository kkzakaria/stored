"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { MovementType, UserRole, Warehouse, Product, ProductVariant } from "@prisma/client";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/shared/loading-state";
import { MovementTypeSelector } from "../_components/movement-type-selector";
import { InForm } from "../_components/in-form";
import { OutForm } from "../_components/out-form";
import { TransferForm } from "../_components/transfer-form";
import { AdjustmentForm } from "../_components/adjustment-form";
import { useSession } from "@/lib/auth/client";

export default function NewMovementPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [selectedType, setSelectedType] = useState<MovementType | null>(null);
  const [warehouses, setWarehouses] = useState<Array<Pick<Warehouse, "id" | "name" | "code" | "active">>>([]);
  const [products, setProducts] = useState<Array<Pick<Product, "id" | "name" | "sku" | "unit"> & { variants: Array<Pick<ProductVariant, "id" | "name" | "sku">> }>>([]);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [warehousesRes, productsRes, roleRes] = await Promise.all([
          fetch("/api/warehouses"),
          fetch("/api/products"),
          fetch("/api/user/role"),
        ]);

        if (warehousesRes.ok && productsRes.ok && roleRes.ok) {
          const warehousesData = await warehousesRes.json();
          const productsData = await productsRes.json();
          const roleData = await roleRes.json();

          setWarehouses(warehousesData.filter((w: { active: boolean }) => w.active));
          setProducts(productsData.filter((p: { active: boolean }) => p.active));
          setUserRole(roleData.role);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isPending || loading) {
    return <LoadingState />;
  }

  if (!session?.user || !userRole) {
    if (!session?.user) {
      router.push("/login");
    }
    return null;
  }

  const handleBack = () => {
    if (selectedType) {
      setSelectedType(null);
    } else {
      router.push("/movements");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Nouveau Mouvement de Stock"
        description={
          selectedType
            ? "Remplissez le formulaire pour enregistrer le mouvement"
            : "Sélectionnez le type de mouvement à effectuer"
        }
        actions={
          <Button variant="outline" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {selectedType ? "Changer de type" : "Retour"}
          </Button>
        }
      />

      {!selectedType ? (
        <MovementTypeSelector
          selectedType={selectedType}
          onSelectType={setSelectedType}
          userRole={userRole}
        />
      ) : (
        <div className="max-w-3xl">
          {selectedType === "IN" && <InForm warehouses={warehouses as Warehouse[]} products={products as (Product & { variants: ProductVariant[] })[]} />}
          {selectedType === "OUT" && <OutForm warehouses={warehouses as Warehouse[]} products={products as (Product & { variants: ProductVariant[] })[]} />}
          {selectedType === "TRANSFER" && <TransferForm warehouses={warehouses as Warehouse[]} products={products as (Product & { variants: ProductVariant[] })[]} />}
          {selectedType === "ADJUSTMENT" && <AdjustmentForm warehouses={warehouses as Warehouse[]} products={products as (Product & { variants: ProductVariant[] })[]} />}
        </div>
      )}
    </div>
  );
}
