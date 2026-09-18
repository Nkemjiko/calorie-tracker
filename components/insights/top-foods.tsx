export type TopFood = {
  id: string
  name: string
  count: number
  totalCalories: number
}

export function TopFoods({ foods }: { foods: TopFood[] }) {
  const maxCalories = Math.max(...foods.map((f) => f.totalCalories), 1)

  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4">
      <div className="flex flex-col gap-0.5">
        <h2 className="text-base font-semibold text-foreground">Most Logged Foods</h2>
        <p className="text-xs text-muted-foreground">Top meals by calories this week</p>
      </div>

      <ol className="flex flex-col gap-3">
        {foods.map((food, index) => {
          const width = Math.round((food.totalCalories / maxCalories) * 100)
          return (
            <li key={food.id} className="flex items-center gap-3">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-bold text-muted-foreground">
                {index + 1}
              </span>
              <div className="flex flex-1 flex-col gap-1.5">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-sm font-medium text-foreground">{food.name}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {food.count}× · {food.totalCalories.toLocaleString()} kcal
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-brand-green"
                    style={{ width: `${width}%` }}
                  />
                </div>
              </div>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
