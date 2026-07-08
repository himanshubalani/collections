// app/page.tsx
import ClientPage from "./ClientPage";
import { getLatestMovies } from "./actions";

export default async function CollectionsPage() {

  const initialMovies = await getLatestMovies();
  
  return <ClientPage initialMovies={initialMovies} />;
}