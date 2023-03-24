export function sort(arrayToSort: any[], sortBy: string, order: "DESC" | "ASC" = "ASC") {
  return arrayToSort.sort((a, b) => {
    if(a[sortBy] > b[sortBy]) {
      return order === "DESC" ? -1 : 1;
    }

    if(a[sortBy] < b[sortBy]) {
      return order === "DESC" ? 1 : -1;
    }

    return 0;
  })
}