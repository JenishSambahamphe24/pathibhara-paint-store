import { useQuery } from "@tanstack/react-query";

import { BreadCrumb } from "#/components/Breadcrumb/Breadcrumb";
import { PageHeader } from "#/components/PageHeader/PageHeader";
import { SkeletonCell } from "#/components/Table/SkeletonCell";

import { m } from "#/paraglide/messages";

import { CalculatorApi } from "../api";
import { CalculatorForm } from "./CalculatorForm";

export function CalculatorPage() {
  const { data: defaults } = useQuery({
    queryKey: ["calculator-defaults"],
    queryFn: CalculatorApi.defaults,
  });

  return (
    <>
      <BreadCrumb items={[{ title: m.sidebar_calculator() }]} />
      <PageHeader
        title={m.calculator_title()}
        description={m.calculator_description()}
      />
      {defaults ? (
        <CalculatorForm defaultWastagePercent={defaults.wastagePercent} />
      ) : (
        <SkeletonCell />
      )}
    </>
  );
}
