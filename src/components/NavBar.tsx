import NavLinks from "@/components/NavLinks";

// Меню розділів окремою липкою смугою (десктоп/планшет): лишається зверху при
// скролі, а темна шапка йде вгору. На телефоні розділи живуть у бургері (шапка),
// тож смугу ховаємо (`hidden sm:block`).
export default function NavBar() {
  return (
    <div className="sticky top-0 z-30 hidden sm:block">
      {/* Синя акцент-лінія — тонкий «капелюх» липкої смуги */}
      <div className="h-0.5 bg-brand-600" />

      {/* Світло-сіра смуга меню: м'якший перехід від темного хедера, ніж різко-біла.
          Легка тінь відділяє її від контенту нижче. */}
      <div className="border-b border-neutral-200 bg-neutral-100 shadow-md">
        <nav className="px-4 sm:px-6">
          <NavLinks />
        </nav>
      </div>
    </div>
  );
}
