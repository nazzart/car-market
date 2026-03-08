export default function Container({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto w-full bg-white max-w-[1280px] px-4">
      {children}
    </main>
  );
}
