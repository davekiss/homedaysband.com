import { cousine } from "@/app/fonts";

export default function ShelfLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={cousine.variable} style={{ display: "contents" }}>
      {children}
    </div>
  );
}
