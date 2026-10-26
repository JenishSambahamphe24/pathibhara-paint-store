import { NotFound } from "#/components/NotFound/NotFound";
import { SkeletonCell } from "#/components/Table/SkeletonCell";

import { useProduct } from "../hooks/useProducts";
import { ProductForm } from "./ProductForm";

interface ProductEditPageProps {
  productId: string;
}

export function ProductEditPage({ productId }: ProductEditPageProps) {
  const { data: product, isLoading, isError } = useProduct(productId);
  if (isError) return <NotFound />;
  if (isLoading || !product) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <SkeletonCell key={i} />
        ))}
      </div>
    );
  }
  // Keyed by id so moving between products remounts the form with fresh defaults.
  return <ProductForm key={product.id} product={product} />;
}
