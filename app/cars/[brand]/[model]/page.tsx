export default async function ModelPage({
  params,
}: {
  params: Promise<{ brand: string; model: string }>;
}) {
  const { brand, model } = await params;

  return (
    <div>
      {brand} {model}
    </div>
  );
}
