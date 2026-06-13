/** The 7 operating modes (OPERATING CONTEXT V2). Become real Claude agents in Step 3. */
export type OperatingMode = {
  key: string;
  label: string;
  state: "idle" | "active" | "standby";
};

export const operatingModes: OperatingMode[] = [
  { key: "founder", label: "Founder", state: "standby" },
  { key: "research", label: "Research", state: "standby" },
  { key: "product", label: "Product", state: "standby" },
  { key: "cto", label: "CTO", state: "active" },
  { key: "execution", label: "Execution", state: "standby" },
  { key: "sales", label: "Sales", state: "idle" },
  { key: "critic", label: "Critic", state: "standby" },
];
