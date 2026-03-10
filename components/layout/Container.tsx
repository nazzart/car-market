export default function Container({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full bg-white max-w-[1280px] px-4">
      {children}
    </div>
  );
}
