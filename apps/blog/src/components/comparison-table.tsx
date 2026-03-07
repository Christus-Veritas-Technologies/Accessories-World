import { Check, X } from "lucide-react";

type CellValue = string | boolean;

interface ComparisonRow {
  label: string;
  values: CellValue[];
}

interface ComparisonTableProps {
  products: string[];
  rows: ComparisonRow[];
}

export function ComparisonTable({ products, rows }: ComparisonTableProps) {
  return (
    <div style={{ overflowX: "auto", margin: "1.5rem 0" }}>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontSize: "0.875rem",
          lineHeight: 1.5,
        }}
      >
        <thead>
          <tr>
            <th
              style={{
                padding: "0.75rem 1rem",
                textAlign: "left",
                borderBottom: "2px solid rgb(209,213,219)",
                fontWeight: 600,
                color: "rgb(17,24,39)",
                background: "rgb(249,250,251)",
                minWidth: "140px",
              }}
            />
            {products.map((p) => (
              <th
                key={p}
                style={{
                  padding: "0.75rem 1rem",
                  textAlign: "center",
                  borderBottom: "2px solid rgb(209,213,219)",
                  fontWeight: 600,
                  color: "rgb(17,24,39)",
                  background: "rgb(249,250,251)",
                  minWidth: "120px",
                }}
              >
                {p}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(({ label, values }, i) => (
            <tr
              key={label}
              style={{ background: i % 2 === 0 ? "white" : "rgb(249,250,251)" }}
            >
              <td
                style={{
                  padding: "0.75rem 1rem",
                  fontWeight: 600,
                  color: "rgb(55,65,81)",
                  borderBottom: "1px solid rgb(229,231,235)",
                }}
              >
                {label}
              </td>
              {values.map((v, j) => (
                <td
                  key={j}
                  style={{
                    padding: "0.75rem 1rem",
                    textAlign: "center",
                    borderBottom: "1px solid rgb(229,231,235)",
                    color: "rgb(55,65,81)",
                  }}
                >
                  {v === true ? (
                    <span style={{ display: "inline-flex", justifyContent: "center", alignItems: "center" }}>
                      <Check size={16} color="#16a34a" strokeWidth={2.5} />
                    </span>
                  ) : v === false ? (
                    <span style={{ display: "inline-flex", justifyContent: "center", alignItems: "center" }}>
                      <X size={16} color="#9ca3af" strokeWidth={2} />
                    </span>
                  ) : (
                    String(v)
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
