import NavLinks from "@/components/NavLinks";

// Меню розділів окремою липкою смугою: лишається зверху при скролі,
// а темна шапка йде вгору. Винесене з <header>, щоб контейнером для
// sticky був увесь layout, а не лише шапка.
export default function NavBar() {
  return (
    <div className="sticky top-0 z-30">
      {/* Синя акцент-лінія — тонкий «капелюх» липкої смуги */}
      <div className="h-0.5 bg-brand-600" />

      {/* Світло-сіра смуга меню: м'якший перехід від темного хедера, ніж різко-біла.
          Легка тінь відділяє її від контенту нижче. */}
      <div className="border-b border-neutral-200 bg-neutral-100 shadow-md">
        <nav className="overflow-x-auto px-4 sm:px-6">
          <NavLinks />
        </nav>
      </div>
    </div>
  );
}
