export interface IPlannerSize {
  volumeMl: number;
}

export interface IContainerPlan<TSize extends IPlannerSize> {
  containers: Array<{ size: TSize; count: number }>;
  totalMl: number;
  overshootMl: number;
}

// Picks how many of each can to buy for `requiredMl`.
//
// 1. Largest-first greedy. If it lands exactly on the amount, use it: that is
//    what the shop does by hand (16 L -> 10 + 4 + 1 + 1, not 4 x 4).
// 2. Otherwise (the sizes can't make the amount greedily, e.g. no 1 L can),
//    an exact search over millilitres for the least overshoot, then fewest
//    cans, then larger cans.
export class ContainerPlanner {
  static plan<TSize extends IPlannerSize>(requiredMl: number, sizes: ReadonlyArray<TSize>): IContainerPlan<TSize> {
    if (sizes.length === 0) throw new Error("No sizes to choose from");
    if (requiredMl <= 0) return { containers: [], totalMl: 0, overshootMl: 0 };

    const descending = [...sizes].sort((a, b) => b.volumeMl - a.volumeMl);
    return ContainerPlanner.greedy(requiredMl, descending) ?? ContainerPlanner.leastOvershoot(requiredMl, descending);
  }

  private static greedy<TSize extends IPlannerSize>(
    requiredMl: number,
    descending: ReadonlyArray<TSize>,
  ): IContainerPlan<TSize> | null {
    let remaining = requiredMl;
    const containers: Array<{ size: TSize; count: number }> = [];
    for (const size of descending) {
      const count = Math.floor(remaining / size.volumeMl);
      if (count > 0) {
        containers.push({ size, count });
        remaining -= count * size.volumeMl;
      }
    }
    return remaining === 0 ? { containers, totalMl: requiredMl, overshootMl: 0 } : null;
  }

  private static leastOvershoot<TSize extends IPlannerSize>(
    requiredMl: number,
    descending: ReadonlyArray<TSize>,
  ): IContainerPlan<TSize> {
    // Work in units of the sizes' gcd: 500/1000/4000 ml become 1/2/8, keeping
    // the table small even for large jobs.
    const unit = descending.reduce((g, size) => ContainerPlanner.gcd(g, size.volumeMl), 0);
    const units = descending.map((size) => size.volumeMl / unit);
    const target = Math.ceil(requiredMl / unit);
    // Any answer overshoots by less than one largest can, so the table stops there.
    const limit = target + units[0];

    const fewest = new Array<number>(limit + 1).fill(Number.POSITIVE_INFINITY);
    fewest[0] = 0;
    for (let total = 1; total <= limit; total++) {
      for (const size of units) {
        if (size <= total && fewest[total - size] + 1 < fewest[total]) {
          fewest[total] = fewest[total - size] + 1;
        }
      }
    }

    let best = -1;
    for (let total = target; total <= limit; total++) {
      if (Number.isFinite(fewest[total])) {
        best = total;
        break;
      }
    }
    if (best < 0) throw new Error("No combination of sizes reaches the amount");

    // Rebuild taking the largest can that still keeps the fewest-cans count,
    // which prefers larger sizes among equally short answers.
    const counts = new Map<number, number>();
    let cursor = best;
    while (cursor > 0) {
      const index = units.findIndex((size) => size <= cursor && fewest[cursor - size] === fewest[cursor] - 1);
      counts.set(index, (counts.get(index) ?? 0) + 1);
      cursor -= units[index];
    }

    const containers = [...counts.entries()]
      .sort(([a], [b]) => a - b)
      .map(([index, count]) => ({ size: descending[index], count }));
    const totalMl = best * unit;
    return { containers, totalMl, overshootMl: totalMl - requiredMl };
  }

  private static gcd(a: number, b: number): number {
    return b === 0 ? a : ContainerPlanner.gcd(b, a % b);
  }
}
